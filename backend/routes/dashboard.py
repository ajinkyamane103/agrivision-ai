"""Farmer Dashboard - Analytics & History"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models.models import ScanHistory, FertilizerRecommendation, CropYieldPrediction

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/stats")
@jwt_required()
def stats():
    uid = int(get_jwt_identity())

    total_scans   = ScanHistory.query.filter_by(user_id=uid).count()
    total_recs    = FertilizerRecommendation.query.filter_by(user_id=uid).count()
    disease_counts = (
        db.session.query(ScanHistory.disease_name, func.count(ScanHistory.id))
        .filter(ScanHistory.user_id == uid, ScanHistory.disease_name.isnot(None))
        .group_by(ScanHistory.disease_name)
        .order_by(func.count(ScanHistory.id).desc())
        .limit(5)
        .all()
    )

    recent_scans = ScanHistory.query.filter_by(user_id=uid).order_by(
        ScanHistory.scanned_at.desc()).limit(5).all()

    return jsonify({
        "total_scans": total_scans,
        "total_fertilizer_recs": total_recs,
        "top_diseases": [{"disease": d, "count": c} for d, c in disease_counts],
        "recent_scans": [{
            "id": s.id, "disease_name": s.disease_name,
            "confidence": s.confidence, "scanned_at": s.scanned_at.isoformat(),
            "image_path": s.image_path,
        } for s in recent_scans],
    })
