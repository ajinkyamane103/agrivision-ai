"""Auth routes - Register / Login / Profile"""
import hashlib
import os
import secrets
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from urllib.parse import urlencode

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models.models import User, PasswordResetToken

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    required = ["name", "email", "password"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    email = _normalize_email(data["email"])
    if _find_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        name=data["name"],
        email=email,
        password_hash=hashed,
        language=data.get("language", "en"),
        state=data.get("state"),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_dict(user)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    user = _find_user_by_email(data.get("email"))
    if not user or not bcrypt.check_password_hash(user.password_hash, data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_dict(user)})


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = _normalize_email(data.get("email"))

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = _find_user_by_email(email)
    dev_reset_url = None

    if user:
        now = datetime.utcnow()
        PasswordResetToken.query.filter_by(
            user_id=user.id,
            used_at=None,
        ).update({"used_at": now})

        raw_token = secrets.token_urlsafe(32)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=now + timedelta(minutes=_reset_token_minutes()),
        )
        db.session.add(reset_token)
        db.session.commit()

        reset_url = _build_reset_url(raw_token)
        email_sent = _send_password_reset_email(user, reset_url)

        if not email_sent:
            current_app.logger.warning(
                "Password reset email could not be sent. Reset URL for %s: %s",
                user.email,
                reset_url,
            )

        if os.environ.get("PASSWORD_RESET_DEV_MODE", "").lower() == "true":
            dev_reset_url = reset_url

    response = {
        "message": "If an account exists with that email, a reset link has been sent.",
    }
    if dev_reset_url:
        response["reset_url"] = dev_reset_url

    return jsonify(response)


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    password = data.get("password") or ""

    if not token:
        return jsonify({"error": "Reset token is required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    reset_token = PasswordResetToken.query.filter_by(
        token_hash=_hash_token(token),
        used_at=None,
    ).first()

    now = datetime.utcnow()
    if not reset_token or reset_token.expires_at < now:
        return jsonify({"error": "Invalid or expired reset link"}), 400

    user = User.query.get(reset_token.user_id)
    if not user:
        return jsonify({"error": "Invalid reset link"}), 400

    user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    reset_token.used_at = now
    db.session.commit()

    return jsonify({"message": "Password reset successful"})


@auth_bp.get("/me")
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    user = User.query.get_or_404(uid)
    return jsonify(_user_dict(user))


@auth_bp.put("/me")
@jwt_required()
def update_profile():
    uid = int(get_jwt_identity())
    user = User.query.get_or_404(uid)
    data = request.get_json()
    for field in ["name", "language", "state", "location_lat", "location_lng"]:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify(_user_dict(user))


def _user_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "language": user.language,
        "state": user.state,
        "location_lat": user.location_lat,
        "location_lng": user.location_lng,
        "created_at": user.created_at.isoformat(),
    }


def _normalize_email(email):
    return (email or "").strip().lower()


def _find_user_by_email(email):
    normalized = _normalize_email(email)
    if not normalized:
        return None
    return User.query.filter(User.email.ilike(normalized)).first()


def _hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _reset_token_minutes():
    try:
        return int(os.environ.get("PASSWORD_RESET_TOKEN_MINUTES", "30"))
    except ValueError:
        return 30


def _build_reset_url(token):
    frontend_url = os.environ.get(
        "FRONTEND_URL",
        "https://agrivision-ai-virid.vercel.app",
    ).rstrip("/")
    return f"{frontend_url}/reset-password?{urlencode({'token': token})}"


def _send_password_reset_email(user, reset_url):
    host = os.environ.get("SMTP_HOST") or os.environ.get("MAIL_SERVER")
    sender = (
        os.environ.get("MAIL_DEFAULT_SENDER")
        or os.environ.get("SMTP_SENDER")
        or os.environ.get("SMTP_USERNAME")
        or os.environ.get("MAIL_USERNAME")
    )

    if not host or not sender:
        return False

    port = int(os.environ.get("SMTP_PORT") or os.environ.get("MAIL_PORT") or "587")
    username = os.environ.get("SMTP_USERNAME") or os.environ.get("MAIL_USERNAME")
    password = os.environ.get("SMTP_PASSWORD") or os.environ.get("MAIL_PASSWORD")
    use_ssl = os.environ.get("SMTP_USE_SSL", "").lower() == "true"
    use_tls = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

    message = EmailMessage()
    message["Subject"] = "Reset your AgriVision AI password"
    message["From"] = sender
    message["To"] = user.email
    message.set_content(
        "\n".join(
            [
                f"Hi {user.name},",
                "",
                "We received a request to reset your AgriVision AI password.",
                f"Open this link to choose a new password: {reset_url}",
                "",
                f"This link expires in {_reset_token_minutes()} minutes.",
                "If you did not request this, you can ignore this email.",
            ]
        )
    )

    try:
        smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with smtp_class(host, port, timeout=10) as smtp:
            if use_tls and not use_ssl:
                smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
        return True
    except Exception:
        current_app.logger.exception("Failed to send password reset email")
        return False
