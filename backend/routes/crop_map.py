"""Map-based crop suggestion by Indian state/district"""
from flask import Blueprint, request, jsonify

crop_map_bp = Blueprint("crop_map", __name__)

# State-wise recommended crops (India)
STATE_CROPS = {
    "Maharashtra":    {"primary": ["Sugarcane","Cotton","Soybean","Onion","Tomato"], "rabi": ["Wheat","Chickpea","Jowar"], "kharif": ["Rice","Maize","Tur Dal"]},
    "Punjab":         {"primary": ["Wheat","Rice","Maize","Cotton"], "rabi": ["Wheat","Mustard"], "kharif": ["Rice","Maize"]},
    "Uttar Pradesh":  {"primary": ["Wheat","Rice","Sugarcane","Potato"], "rabi": ["Wheat","Pea","Mustard"], "kharif": ["Rice","Maize","Arhar"]},
    "Madhya Pradesh": {"primary": ["Soybean","Wheat","Maize","Chickpea"], "rabi": ["Wheat","Chickpea","Mustard"], "kharif": ["Soybean","Maize","Rice"]},
    "Rajasthan":      {"primary": ["Bajra","Jowar","Mustard","Clusterbean"], "rabi": ["Wheat","Mustard","Barley"], "kharif": ["Bajra","Maize","Sesame"]},
    "Karnataka":      {"primary": ["Rice","Ragi","Maize","Sugarcane","Coffee"], "rabi": ["Wheat","Jowar"], "kharif": ["Rice","Maize","Ragi"]},
    "Andhra Pradesh": {"primary": ["Rice","Cotton","Chillies","Groundnut"], "rabi": ["Jowar","Sunflower"], "kharif": ["Rice","Maize","Cotton"]},
    "Tamil Nadu":     {"primary": ["Rice","Banana","Sugarcane","Groundnut"], "rabi": ["Sorghum","Sunflower"], "kharif": ["Rice","Maize","Cotton"]},
    "Gujarat":        {"primary": ["Cotton","Groundnut","Wheat","Bajra","Castor"], "rabi": ["Wheat","Chickpea","Mustard"], "kharif": ["Groundnut","Cotton","Bajra"]},
    "Bihar":          {"primary": ["Rice","Wheat","Maize","Potato","Lychee"], "rabi": ["Wheat","Mustard","Potato"], "kharif": ["Rice","Maize","Jute"]},
    "West Bengal":    {"primary": ["Rice","Jute","Tea","Potato"], "rabi": ["Potato","Mustard","Wheat"], "kharif": ["Rice","Jute","Maize"]},
    "Haryana":        {"primary": ["Wheat","Rice","Sugarcane","Cotton","Mustard"], "rabi": ["Wheat","Mustard","Barley"], "kharif": ["Rice","Cotton","Bajra"]},
    "Odisha":         {"primary": ["Rice","Coconut","Jute","Groundnut"], "rabi": ["Wheat","Mustard"], "kharif": ["Rice","Maize","Pulses"]},
    "Assam":          {"primary": ["Rice","Tea","Jute","Sugarcane"], "rabi": ["Mustard","Potato"], "kharif": ["Rice","Jute","Maize"]},
    "Telangana":      {"primary": ["Rice","Cotton","Maize","Chillies","Soybean"], "rabi": ["Jowar","Sunflower"], "kharif": ["Rice","Maize","Cotton"]},
    "Kerala":         {"primary": ["Coconut","Rubber","Tea","Spices","Banana"], "rabi": ["Vegetables"], "kharif": ["Rice","Tapioca"]},
    "Jharkhand":      {"primary": ["Rice","Maize","Pulses","Oilseeds"], "rabi": ["Wheat","Mustard"], "kharif": ["Rice","Maize"]},
    "Himachal Pradesh":{"primary": ["Apple","Wheat","Maize","Potato","Off-Season Vegetables"], "rabi": ["Wheat","Barley","Pea"], "kharif": ["Maize","Rice"]},
    "Uttarakhand":    {"primary": ["Wheat","Rice","Potato","Sugarcane","Fruit"], "rabi": ["Wheat","Mustard","Pea"], "kharif": ["Rice","Maize"]},
    "Chhattisgarh":   {"primary": ["Rice","Maize","Pulses","Oilseeds"], "rabi": ["Wheat","Chickpea"], "kharif": ["Rice","Maize","Soybean"]},
    "Goa":            {"primary": ["Rice","Coconut","Cashew","Spices"], "rabi": ["Vegetables"], "kharif": ["Rice"]},
    "Tripura":        {"primary": ["Rice","Jute","Rubber","Pineapple"], "rabi": ["Mustard","Potato"], "kharif": ["Rice","Jute"]},
    "Manipur":        {"primary": ["Rice","Vegetables","Fruit"], "rabi": ["Mustard","Pea"], "kharif": ["Rice","Maize"]},
    "Meghalaya":      {"primary": ["Potato","Ginger","Turmeric","Rice"], "rabi": ["Potato","Pea"], "kharif": ["Rice","Maize"]},
    "Nagaland":       {"primary": ["Rice","Maize","Potato","Vegetables"], "rabi": ["Potato","Pea"], "kharif": ["Rice","Maize"]},
    "Mizoram":        {"primary": ["Rice","Maize","Ginger","Turmeric"], "rabi": ["Mustard","Pea"], "kharif": ["Rice","Maize"]},
    "Arunachal Pradesh": {"primary": ["Rice","Maize","Ginger","Large Cardamom"], "rabi": ["Wheat","Mustard"], "kharif": ["Rice","Maize"]},
    "Sikkim":         {"primary": ["Cardamom","Ginger","Maize","Rice"], "rabi": ["Wheat","Barley"], "kharif": ["Maize","Rice"]},
}

# Approximate coordinates for Indian states (centroid)
STATE_COORDS = {
    "Maharashtra": {"lat": 19.75, "lng": 75.71},
    "Punjab": {"lat": 31.15, "lng": 75.34},
    "Uttar Pradesh": {"lat": 26.85, "lng": 80.91},
    "Madhya Pradesh": {"lat": 22.97, "lng": 78.66},
    "Rajasthan": {"lat": 27.02, "lng": 74.22},
    "Karnataka": {"lat": 15.32, "lng": 75.71},
    "Andhra Pradesh": {"lat": 15.91, "lng": 79.74},
    "Tamil Nadu": {"lat": 11.12, "lng": 78.66},
    "Gujarat": {"lat": 22.26, "lng": 71.19},
    "Bihar": {"lat": 25.69, "lng": 85.31},
    "West Bengal": {"lat": 22.98, "lng": 87.85},
    "Haryana": {"lat": 29.06, "lng": 76.09},
    "Odisha": {"lat": 20.95, "lng": 85.10},
    "Assam": {"lat": 26.14, "lng": 91.77},
    "Telangana": {"lat": 18.11, "lng": 79.02},
    "Kerala": {"lat": 10.85, "lng": 76.27},
    "Jharkhand": {"lat": 23.61, "lng": 85.28},
    "Himachal Pradesh": {"lat": 31.10, "lng": 77.17},
    "Uttarakhand": {"lat": 30.07, "lng": 79.09},
    "Chhattisgarh": {"lat": 21.27, "lng": 81.86},
    "Goa": {"lat": 15.30, "lng": 74.12},
}


@crop_map_bp.get("/states")
def all_states():
    """Return all states with coordinates and top crops for map display."""
    result = []
    for state, crops in STATE_CROPS.items():
        coords = STATE_COORDS.get(state, {"lat": 20.59, "lng": 78.96})
        result.append({
            "state": state,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "primary_crops": crops["primary"][:4],
            "kharif": crops.get("kharif", [])[:3],
            "rabi": crops.get("rabi", [])[:3],
        })
    return jsonify(result)


@crop_map_bp.get("/state/<state_name>")
def state_crops(state_name):
    """Return detailed crop info for a specific state."""
    data = STATE_CROPS.get(state_name)
    if not data:
        return jsonify({"error": f"State '{state_name}' not found"}), 404
    coords = STATE_COORDS.get(state_name, {"lat": 20.59, "lng": 78.96})
    return jsonify({
        "state": state_name,
        "coordinates": coords,
        **data,
    })


@crop_map_bp.get("/suggest")
def suggest_by_coords():
    """Suggest crops based on lat/lng (maps to nearest state)."""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    if lat is None or lng is None:
        return jsonify({"error": "lat and lng required"}), 400

    # Find nearest state centroid
    best_state = None
    best_dist = float("inf")
    for state, coords in STATE_COORDS.items():
        dist = ((lat - coords["lat"]) ** 2 + (lng - coords["lng"]) ** 2) ** 0.5
        if dist < best_dist:
            best_dist = dist
            best_state = state

    crops = STATE_CROPS.get(best_state, {})
    return jsonify({
        "detected_state": best_state,
        "crops": crops,
        "note": "Crops recommended based on your geographic location",
    })
