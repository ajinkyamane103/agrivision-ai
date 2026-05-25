"""Auth routes - Register / Login / Profile"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()
    required = ["name", "email", "password"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        name=data["name"],
        email=data["email"],
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
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_dict(user)})


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
