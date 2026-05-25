# AgriVision AI — Full API Reference

Base URL: `http://localhost:5000/api`

All responses are JSON. Protected routes require header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST /auth/register
Create a new user account.

**Body:**
```json
{
  "name": "Ramesh Patil",
  "email": "ramesh@example.com",
  "password": "securepass123",
  "language": "mr",
  "state": "Maharashtra"
}
```
**Response 201:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "Ramesh Patil", "email": "...", "language": "mr", "state": "Maharashtra" }
}
```

---

### POST /auth/login
**Body:** `{ "email": "...", "password": "..." }`

**Response 200:** Same as register.

---

### GET /auth/me *(protected)*
Returns current user profile.

---

### PUT /auth/me *(protected)*
Update profile fields: `name`, `language`, `state`, `location_lat`, `location_lng`.

---

## Disease Detection

### POST /disease/predict
Upload a leaf image for disease detection.

**Form Data:**
- `image` (file, required) — JPG/PNG/WEBP, max 16MB
- `lat` (float, optional) — GPS latitude for location tagging
- `lng` (float, optional) — GPS longitude

**Response — Disease Detected:**
```json
{
  "type": "disease_detection",
  "disease_name": "Tomato___Late_blight",
  "description": "Late blight is caused by...",
  "prevention": "Apply Mancozeb 75% WP...",
  "supplement_name": "Mancozeb",
  "supplement_image_url": "https://...",
  "buy_link": "https://bighaat.com/...",
  "confidence": 94.7,
  "image_path": "static/uploads/abc123.jpg",
  "scan_id": 42
}
```

**Response — No Leaf (Plant ID fallback):**
```json
{
  "type": "plant_identification",
  "plant_type": "Leafy vegetable / Herb",
  "confidence": 67.3,
  "message": "No disease leaf detected. Identified plant type instead."
}
```

---

### GET /disease/history *(protected)*
Returns last 50 scans for the logged-in user.

```json
[
  {
    "id": 42,
    "disease_name": "Tomato___Late_blight",
    "confidence": 0.947,
    "supplement": "Mancozeb",
    "scanned_at": "2024-04-15T10:30:00",
    "image_path": "static/uploads/abc123.jpg"
  }
]
```

---

## Fertilizer Recommendation

### POST /fertilizer/recommend
**Body:**
```json
{
  "nitrogen": 80,
  "phosphorus": 40,
  "potassium": 20,
  "soil_type": "Loamy",
  "crop_type": "Wheat",
  "temperature": 24,
  "humidity": 65,
  "moisture": 45
}
```
**Response:**
```json
{
  "recommended_fertilizer": "Urea",
  "crop_specific_advice": "Use DAP + Urea split application...",
  "weather_note": "",
  "adjusted_npk": { "N": 80.0, "P": 40.0, "K": 20.0 },
  "application_note": "Based on Loamy soil type with Wheat crop."
}
```

### GET /fertilizer/soil-types
Returns list of supported soil types.

### GET /fertilizer/crops
Returns list of supported crop types.

---

## Weather & Crop Planning

### GET /weather/current?lat=19.07&lon=72.87
Returns current weather from Open-Meteo.

```json
{
  "temperature": 32.1,
  "humidity": 74,
  "weekly_rainfall_mm": 12.5,
  "wind_speed": 14.3
}
```

### GET /weather/crop-suggestions?lat=19.07&lon=72.87
Returns weather + list of suitable crops scored 1–3.

```json
{
  "weather": { "temperature": 32.1, "humidity": 74, "weekly_rainfall_mm": 12.5 },
  "recommended_crops": [
    { "crop": "Rice", "suitability_score": 3, "ideal": true },
    { "crop": "Sugarcane", "suitability_score": 2, "ideal": false }
  ],
  "total_suggestions": 12
}
```

---

## AI Chatbot

### POST /chatbot/chat
**Body:**
```json
{
  "message": "टमाटर में ब्लाइट कैसे ठीक करें?",
  "session_id": "session_abc123",
  "language": "hi"
}
```
**Response:**
```json
{
  "reply": "टमाटर में लेट ब्लाइट के लिए मैनकोज़ेब 75% WP...",
  "session_id": "session_abc123",
  "source": "llm",
  "language": "hi"
}
```
- `source`: `"llm"` (Groq AI) or `"rule_based"` (fallback)

### GET /chatbot/history/<session_id>
Returns full chat history for a session.

---

## News

### GET /news/?category=market
- `category`: `general` | `weather` | `market` | `schemes` | `disease`

**Response:**
```json
{
  "articles": [
    {
      "title": "Wheat MSP raised to ₹2275/quintal",
      "url": "https://pib.gov.in/...",
      "source": "PIB",
      "published_at": "2024-04-10",
      "category": "market"
    }
  ],
  "source": "mock"
}
```

### GET /news/categories
Returns list of available categories.

---

## Market

### GET /market/products
Query params:
- `disease` (string) — filter by disease name (e.g. `"blight"`)
- `crop` (string) — filter by crop (e.g. `"tomato"`)
- `category` (string) — filter by product category

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Mancozeb 75% WP",
      "category": "Fungicide",
      "price": 280,
      "unit": "500g",
      "for_disease": ["Late Blight", "Downy Mildew"],
      "for_crop": ["Potato", "Tomato"],
      "image": "https://...",
      "buy_url": "https://bighaat.com"
    }
  ],
  "count": 1
}
```

---

## Crop Map

### GET /crop-map/states
Returns all Indian states with coordinates and crop data for map display.

```json
[
  {
    "state": "Maharashtra",
    "lat": 19.75,
    "lng": 75.71,
    "primary_crops": ["Sugarcane", "Cotton", "Soybean", "Onion"],
    "kharif": ["Rice", "Maize", "Tur Dal"],
    "rabi": ["Wheat", "Chickpea", "Jowar"]
  }
]
```

### GET /crop-map/state/<state_name>
Detailed crop data for a single state.

### GET /crop-map/suggest?lat=19.07&lng=72.87
Auto-detects nearest state and returns crop recommendations.

```json
{
  "detected_state": "Maharashtra",
  "crops": {
    "primary": ["Sugarcane", "Cotton", "Soybean"],
    "kharif": ["Rice", "Maize", "Tur Dal"],
    "rabi": ["Wheat", "Chickpea", "Jowar"]
  },
  "note": "Crops recommended based on your geographic location"
}
```

---

## Dashboard

### GET /dashboard/stats *(protected)*
Returns farmer analytics summary.

```json
{
  "total_scans": 24,
  "total_fertilizer_recs": 8,
  "top_diseases": [
    { "disease": "Tomato___Late_blight", "count": 7 },
    { "disease": "Corn___Common_rust", "count": 3 }
  ],
  "recent_scans": [ ... ]
}
```

---

## Health Check

### GET /api/health
```json
{ "status": "ok", "version": "2.0.0", "project": "AgriVision AI Mega" }
```
