"""
AgriVision AI - Database Models
"""
from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    language      = db.Column(db.String(10), default="en")
    location_lat  = db.Column(db.Float, nullable=True)
    location_lng  = db.Column(db.Float, nullable=True)
    state         = db.Column(db.String(50), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    profile_pic   = db.Column(db.String(300), nullable=True)
    scans         = db.relationship("ScanHistory", backref="user", lazy=True)


class ScanHistory(db.Model):
    __tablename__ = "scan_history"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    image_path    = db.Column(db.String(300), nullable=False)
    disease_name  = db.Column(db.String(200), nullable=True)
    plant_type    = db.Column(db.String(100), nullable=True)
    confidence    = db.Column(db.Float, nullable=True)
    description   = db.Column(db.Text, nullable=True)
    prevention    = db.Column(db.Text, nullable=True)
    supplement    = db.Column(db.String(200), nullable=True)
    buy_link      = db.Column(db.String(500), nullable=True)
    latitude      = db.Column(db.Float, nullable=True)
    longitude     = db.Column(db.Float, nullable=True)
    scanned_at    = db.Column(db.DateTime, default=datetime.utcnow)


class FertilizerRecommendation(db.Model):
    __tablename__ = "fertilizer_recommendations"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    nitrogen      = db.Column(db.Float)
    phosphorus    = db.Column(db.Float)
    potassium     = db.Column(db.Float)
    soil_type     = db.Column(db.String(50))
    crop_type     = db.Column(db.String(100))
    temperature   = db.Column(db.Float)
    humidity      = db.Column(db.Float)
    moisture      = db.Column(db.Float)
    result        = db.Column(db.String(200))
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    session_id    = db.Column(db.String(100), nullable=False)
    role          = db.Column(db.String(20))
    content       = db.Column(db.Text)
    language      = db.Column(db.String(10), default="en")
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)


class CropYieldPrediction(db.Model):
    __tablename__ = "crop_yield_predictions"
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    crop            = db.Column(db.String(100))
    state           = db.Column(db.String(50))
    area_hectares   = db.Column(db.Float)
    season          = db.Column(db.String(30))
    rainfall        = db.Column(db.Float)
    predicted_yield = db.Column(db.Float)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
