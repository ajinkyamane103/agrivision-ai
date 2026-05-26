"""
Disease Detection Route
- Accepts image upload
- Detects plant disease OR plant type (if not a leaf)
- Returns confidence score, prevention steps, supplement
- Saves to scan history
"""
import os, uuid
import gdown
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import pandas as pd
import numpy as np
from PIL import Image
import torchvision.transforms.functional as TF

from extensions import db
from models.models import ScanHistory

disease_bp = Blueprint("disease", __name__)

# ── Load data CSVs ────────────────────────────────────────────────────────
_BASE = os.path.dirname(__file__)
disease_info    = pd.read_csv(os.path.join(_BASE, "../data/disease_info.csv"), encoding="cp1252")
supplement_info = pd.read_csv(os.path.join(_BASE, "../data/supplement_info.csv"), encoding="cp1252")

# ── Lazy-load model ───────────────────────────────────────────────────────
_model = None

def get_model():
    global _model
    if _model is None:
        import torch
        from ml_models.cnn import CNN
        
        model_path = os.path.join(_BASE, "../ml_models/plant_disease_model_1_latest.pt")
        if not os.path.exists(model_path):
          url = "https://drive.google.com/uc?id=1J9sXG6quiOZoSkVxCXxU668mw6MRBK0u"
          gdown.download(url, model_path, quiet=False)
        with open(model_path, "rb") as f:
          print("MODEL FIRST BYTES:", f.read(50))              
        _model = CNN(39)
        if os.path.exists(model_path):
            _model.load_state_dict(torch.load(model_path, map_location="cpu"))
        _model.eval()
    return _model


def run_prediction(image_path: str):
    """Returns (class_index, confidence_float)"""
    import torch
    import torch.nn.functional as F
    model = get_model()
    img = Image.open(image_path).resize((224, 224)).convert("RGB")
    tensor = TF.to_tensor(img).unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor)
        probs  = F.softmax(logits, dim=1)
        conf, idx = torch.max(probs, dim=1)
    return int(idx.item()), float(conf.item())


ALLOWED = {"png", "jpg", "jpeg", "webp"}

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED


@disease_bp.post("/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    if not allowed(file.filename):
        return jsonify({"error": "Invalid file type. Use jpg/png/webp"}), 400

    # Save file
    ext = file.filename.rsplit(".", 1)[1].lower()
    fname = f"{uuid.uuid4().hex}.{ext}"
    save_dir = os.path.join(current_app.config["UPLOAD_FOLDER"])
    os.makedirs(save_dir, exist_ok=True)
    fpath = os.path.join(save_dir, fname)
    file.save(fpath)

    # Predict
    pred_idx, confidence = run_prediction(fpath)
    pred_name = disease_info.iloc[pred_idx]["disease_name"]

    if confidence < 0.45:
     return jsonify({
        "type": "low_confidence",
        "disease_name": pred_name.replace("___", " - "),
        "description": "Prediction confidence is low. Try a clearer image.",
        "prevention": "Use bright lighting and focus on affected leaf area.",
        "confidence": round(confidence * 100, 1),
        "image_path": f"static/uploads/{fname}",
    })

    # Class 4 = Background_without_leaves → detect plant type instead
    is_non_leaf = (pred_idx == 4)

    if is_non_leaf:
        # Fallback: use a simple heuristic or secondary model
        plant_type = _detect_plant_type(fpath)
        result = {
            "type": "plant_identification",
            "plant_type": plant_type,
            "confidence": round(confidence * 100, 1),
            "message": "No disease leaf detected. Identified plant type instead.",
            "image_path": f"static/uploads/{fname}",
        }
    else:
        row  = disease_info.iloc[pred_idx]
        srow = supplement_info.iloc[pred_idx]
        result = {
            "type": "disease_detection",
            "disease_name": str(row.get("disease_name", "")),
            "description":  str(row.get("description", "")),
            "prevention":   str(row.get("Possible Steps", "")),
            "image_url":    str(row.get("image_url", "")),
            "supplement_name":      str(srow.get("supplement name", "")),
            "supplement_image_url": str(srow.get("supplement image", "")),
            "buy_link":             str(srow.get("buy link", "")),
            "confidence": round(confidence * 100, 1),
            "image_path": f"static/uploads/{fname}",
        }

    # Optional: save to DB if user is authenticated
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
    except Exception:
        uid = None

    if uid:
        scan = ScanHistory(
            user_id=int(uid),
            image_path=f"static/uploads/{fname}",
            disease_name=result.get("disease_name") if not is_non_leaf else None,
            plant_type=result.get("plant_type") if is_non_leaf else None,
            confidence=confidence,
            description=result.get("description"),
            prevention=result.get("prevention"),
            supplement=result.get("supplement_name"),
            buy_link=result.get("buy_link"),
            latitude=request.form.get("lat", type=float),
            longitude=request.form.get("lng", type=float),
        )
        db.session.add(scan)
        db.session.commit()
        result["scan_id"] = scan.id

    return jsonify(result)


def _detect_plant_type(image_path: str) -> str:
    """
    Placeholder for a secondary plant-type classifier.
    In production: use a fine-tuned EfficientNetV2 or PlantNet API.
    Returns a friendly plant category string.
    """
    # Heuristic based on dominant colour (green → leafy, brown → root, etc.)
    img = Image.open(image_path).convert("RGB").resize((64, 64))
    arr = np.array(img)
    r_mean, g_mean, b_mean = arr[:, :, 0].mean(), arr[:, :, 1].mean(), arr[:, :, 2].mean()

    if g_mean > r_mean and g_mean > b_mean:
        return "Leafy vegetable / Herb"
    elif r_mean > g_mean:
        return "Fruit / Flower plant"
    elif b_mean > g_mean:
        return "Unknown plant (recommend PlantNet scan)"
    return "General plant"


@disease_bp.get("/history")
@jwt_required()
def history():
    uid = int(get_jwt_identity())
    scans = ScanHistory.query.filter_by(user_id=uid).order_by(ScanHistory.scanned_at.desc()).limit(50).all()
    return jsonify([{
        "id":           s.id,
        "disease_name": s.disease_name,
        "plant_type":   s.plant_type,
        "confidence":   s.confidence,
        "supplement":   s.supplement,
        "scanned_at":   s.scanned_at.isoformat(),
        "image_path":   s.image_path,
    } for s in scans])
