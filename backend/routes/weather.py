"""
Weather-based Crop Suggestion
Uses Open-Meteo (free, no API key needed) + crop suitability rules
"""
import requests
from flask import Blueprint, request, jsonify

weather_bp = Blueprint("weather", __name__)

# Crop suitability matrix [temp_min, temp_max, rainfall_min_mm, rainfall_max_mm, humidity_min, humidity_max]
CROP_CONDITIONS = {
    "Rice":         {"temp": (20, 35), "rain": (100, 200), "humidity": (60, 90)},
    "Wheat":        {"temp": (10, 25), "rain": (30, 100),  "humidity": (40, 70)},
    "Maize":        {"temp": (18, 32), "rain": (50, 120),  "humidity": (50, 80)},
    "Soybean":      {"temp": (20, 30), "rain": (60, 120),  "humidity": (55, 80)},
    "Sugarcane":    {"temp": (24, 38), "rain": (100, 250), "humidity": (60, 90)},
    "Cotton":       {"temp": (21, 37), "rain": (50, 100),  "humidity": (40, 70)},
    "Groundnut":    {"temp": (25, 35), "rain": (50, 120),  "humidity": (45, 75)},
    "Tomato":       {"temp": (18, 29), "rain": (40, 80),   "humidity": (50, 70)},
    "Potato":       {"temp": (10, 22), "rain": (50, 100),  "humidity": (50, 75)},
    "Onion":        {"temp": (13, 24), "rain": (30, 80),   "humidity": (40, 65)},
    "Banana":       {"temp": (20, 35), "rain": (100, 180), "humidity": (65, 90)},
    "Mango":        {"temp": (24, 38), "rain": (60, 120),  "humidity": (40, 75)},
    "Chickpea":     {"temp": (15, 29), "rain": (30, 80),   "humidity": (35, 65)},
    "Mustard":      {"temp": (10, 25), "rain": (25, 70),   "humidity": (35, 65)},
    "Sunflower":    {"temp": (20, 32), "rain": (40, 90),   "humidity": (40, 70)},
    "Turmeric":     {"temp": (20, 30), "rain": (100, 150), "humidity": (60, 85)},
    "Ginger":       {"temp": (20, 32), "rain": (120, 180), "humidity": (65, 85)},
    "Watermelon":   {"temp": (24, 38), "rain": (30, 70),   "humidity": (35, 65)},
    "Bitter Gourd": {"temp": (24, 35), "rain": (50, 110),  "humidity": (55, 80)},
    "Capsicum":     {"temp": (18, 28), "rain": (40, 90),   "humidity": (50, 75)},
}


def fetch_weather(lat: float, lon: float) -> dict:
    """Fetch current weather from Open-Meteo (free, no key required)."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
        "hourly": "relativehumidity_2m,precipitation",
        "daily": "precipitation_sum",
        "forecast_days": 7,
        "timezone": "Asia/Kolkata",
    }
    try:
        r = requests.get(url, params=params, timeout=10)
        data = r.json()
        current = data.get("current_weather", {})
        hourly  = data.get("hourly", {})
        daily   = data.get("daily", {})

        temp      = current.get("temperature", 25)
        humidity  = hourly.get("relativehumidity_2m", [50])[0]
        weekly_rain = sum(daily.get("precipitation_sum", [0]))

        return {
            "temperature": temp,
            "humidity": humidity,
            "weekly_rainfall_mm": round(weekly_rain, 1),
            "wind_speed": current.get("windspeed", 0),
        }
    except Exception as e:
        return {"temperature": 25, "humidity": 60, "weekly_rainfall_mm": 50, "error": str(e)}


def suggest_crops(temp, humidity, weekly_rain_mm):
    suitable = []
    monthly_rain = weekly_rain_mm * 4  # rough estimate

    for crop, cond in CROP_CONDITIONS.items():
        t_ok = cond["temp"][0] <= temp <= cond["temp"][1]
        r_ok = cond["rain"][0] <= monthly_rain <= cond["rain"][1]
        h_ok = cond["humidity"][0] <= humidity <= cond["humidity"][1]
        score = sum([t_ok, r_ok, h_ok])
        if score >= 2:
            suitable.append({"crop": crop, "suitability_score": score, "ideal": score == 3})

    suitable.sort(key=lambda x: -x["suitability_score"])
    return suitable


@weather_bp.get("/current")
def current_weather():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "lat and lon required"}), 400
    data = fetch_weather(lat, lon)
    return jsonify(data)


@weather_bp.get("/crop-suggestions")
def crop_suggestions():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "lat and lon required"}), 400

    weather = fetch_weather(lat, lon)
    crops = suggest_crops(
        temp=weather["temperature"],
        humidity=weather["humidity"],
        weekly_rain_mm=weather["weekly_rainfall_mm"],
    )
    return jsonify({
        "weather": weather,
        "recommended_crops": crops,
        "total_suggestions": len(crops),
    })
