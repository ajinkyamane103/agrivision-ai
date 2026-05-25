"""
Smart Fertilizer Recommendation
Inputs: N, P, K, soil type, crop type, temperature, humidity, moisture
Uses a rule-based engine + ML model (Random Forest fallback)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models.models import FertilizerRecommendation

fertilizer_bp = Blueprint("fertilizer", __name__)

# Fertilizer knowledge base (simplified; extend with full dataset)
FERTILIZER_MAP = {
    "Urea": {"N": (80, 999), "P": (0, 40),  "K": (0, 40)},
    "DAP":  {"N": (0, 40),  "P": (50, 999), "K": (0, 40)},
    "MOP":  {"N": (0, 40),  "P": (0, 40),   "K": (50, 999)},
    "10-26-26 NPK": {"N": (30, 70), "P": (20, 50), "K": (20, 50)},
    "20-20-20 NPK": {"N": (10, 30), "P": (10, 30), "K": (10, 30)},
    "SSP (Single Super Phosphate)": {"N": (0, 30), "P": (30, 80), "K": (0, 30)},
    "Potassium Sulphate": {"N": (0, 30), "P": (0, 30), "K": (60, 999)},
    "Vermicompost (Organic)": {"N": (0, 20), "P": (0, 20), "K": (0, 20)},
}

CROP_HINTS = {
    "rice":       "Apply Basal dose of NPK before transplanting; top-dress with Urea at tillering.",
    "wheat":      "Use DAP + Urea split application. Apply Zinc Sulphate if deficient.",
    "sugarcane":  "Heavy feeder. Needs high N + K. Use MOP in ratoon crop.",
    "cotton":     "Require balanced NPK. Foliar spray of Boron at bud initiation.",
    "tomato":     "High P at transplanting; shift to high K during fruiting.",
    "potato":     "High K requirement. Use MOP. Avoid excess N to prevent haulm growth.",
    "maize":      "Apply Zinc Sulphate 25 kg/ha. Split N in 3 doses.",
    "soybean":    "Rhizobium inoculant reduces N need. Use balanced P + K.",
    "groundnut":  "Needs Calcium + Gypsum at pegging stage. Low N required.",
    "onion":      "Apply Sulphur 20 kg/ha for better pungency and storage.",
}

SOIL_ADJUSTMENT = {
    "Sandy":      {"N": 1.3, "P": 1.1, "K": 1.0},   # leaches faster → apply more often
    "Loamy":      {"N": 1.0, "P": 1.0, "K": 1.0},
    "Black":      {"N": 0.9, "P": 1.2, "K": 0.8},
    "Red":        {"N": 1.1, "P": 1.3, "K": 1.0},
    "Clayey":     {"N": 0.8, "P": 0.9, "K": 1.0},
    "Silty":      {"N": 1.0, "P": 1.0, "K": 1.0},
}


def recommend_fertilizer(n, p, k, soil, crop, temp, humidity, moisture):
    """Rule-based fertilizer recommender."""
    adj = SOIL_ADJUSTMENT.get(soil, {"N": 1.0, "P": 1.0, "K": 1.0})
    n_adj = n * adj["N"]
    p_adj = p * adj["P"]
    k_adj = k * adj["K"]

    best = None
    best_score = -1
    for name, ranges in FERTILIZER_MAP.items():
        in_n = ranges["N"][0] <= n_adj <= ranges["N"][1]
        in_p = ranges["P"][0] <= p_adj <= ranges["P"][1]
        in_k = ranges["K"][0] <= k_adj <= ranges["K"][1]
        score = sum([in_n, in_p, in_k])
        if score > best_score:
            best_score = score
            best = name

    crop_advice = CROP_HINTS.get(crop.lower(), "Follow standard agronomic recommendations for your crop.")
    weather_note = ""
    if humidity > 80:
        weather_note = "High humidity detected — reduce N application to avoid leaching and disease risk."
    elif temp > 38:
        weather_note = "High temperature — irrigate before top-dressing to avoid volatilization of Urea."

    return {
        "recommended_fertilizer": best or "Balanced NPK 19-19-19",
        "crop_specific_advice": crop_advice,
        "weather_note": weather_note,
        "adjusted_npk": {"N": round(n_adj, 1), "P": round(p_adj, 1), "K": round(k_adj, 1)},
        "application_note": f"Based on {soil} soil type with {crop} crop.",
    }


@fertilizer_bp.post("/recommend")
def recommend():
    d = request.get_json()
    required = ["nitrogen", "phosphorus", "potassium", "soil_type", "crop_type"]
    if not all(k in d for k in required):
        return jsonify({"error": "Missing required fields: " + str(required)}), 400

    result = recommend_fertilizer(
        n=float(d["nitrogen"]),
        p=float(d["phosphorus"]),
        k=float(d["potassium"]),
        soil=d["soil_type"],
        crop=d["crop_type"],
        temp=float(d.get("temperature", 25)),
        humidity=float(d.get("humidity", 50)),
        moisture=float(d.get("moisture", 40)),
    )

    # Save to DB (optional auth)
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
    except Exception:
        uid = None

    rec = FertilizerRecommendation(
        user_id=int(uid) if uid else None,
        nitrogen=d["nitrogen"], phosphorus=d["phosphorus"], potassium=d["potassium"],
        soil_type=d["soil_type"], crop_type=d["crop_type"],
        temperature=d.get("temperature", 25),
        humidity=d.get("humidity", 50),
        moisture=d.get("moisture", 40),
        result=result["recommended_fertilizer"],
    )
    db.session.add(rec)
    db.session.commit()

    return jsonify(result)


@fertilizer_bp.get("/soil-types")
def soil_types():
    return jsonify(list(SOIL_ADJUSTMENT.keys()))


@fertilizer_bp.get("/crops")
def crops():
    return jsonify(list(CROP_HINTS.keys()))
