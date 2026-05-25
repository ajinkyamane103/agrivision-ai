# 🌿 AgriVision AI — Smart Agricultural Intelligence Platform

<div align="center">

![AgriVision AI Banner](https://placehold.co/900x300/2D7A3A/ffffff?text=🌿+AgriVision+AI+—+Mega+Project+v2.0)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3-EE4C2C?style=flat&logo=pytorch)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Final Year B.Tech CSE Data Science Project — 2026*

An end-to-end, AI-powered agricultural intelligence platform built for Indian farmers. Combines deep learning, real-time weather data, multilingual AI chatbot, and interactive crop mapping.

[🚀 Live Demo](#) • [📖 Docs](#installation) • [🎓 Viva Prep](#viva-preparation)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Implementation Phases](#-implementation-phases)
- [Future Scope](#-future-scope)
- [Viva Preparation](#-viva-preparation)

---

## 🌱 Project Overview

AgriVision AI is a full-stack, AI-powered agricultural intelligence platform designed for Indian farmers. It combines:

- **Deep Learning** (CNN / EfficientNet) for real-time plant disease detection from leaf images
- **Smart Fertilizer Engine** with soil, crop, and weather intelligence
- **Interactive Crop Map** with state-wise recommendations across India
- **Multi-language AI Chatbot** (10 Indian languages) powered by Groq's Llama-3
- **Live Weather Integration** via Open-Meteo for crop planning
- **Agricultural News Feed** categorized by weather, market prices, and schemes
- **Smart Marketplace** with disease-based product recommendations
- **Farmer Dashboard** with analytics, scan history, and personalized insights

---

## 🔧 Features

| Feature | Description | Status |
|---|---|---|
| 🔬 Disease Detection | 39-class CNN with 95%+ accuracy on PlantVillage dataset | ✅ |
| 🪴 Plant Identification | Auto-detects plant type when no disease leaf is present | ✅ |
| 🌿 Smart Fertilizer | NPK + soil + weather-aware fertilizer recommendations | ✅ |
| 🗺️ Crop Map | Interactive Leaflet.js map with state-wise crop data for all 28 states | ✅ |
| 🌤️ Weather Planner | Real-time weather + 20+ crop suitability scoring | ✅ |
| 🤖 AgriBot Chatbot | Multilingual AI chatbot (Groq Llama-3) with rule-based fallback | ✅ |
| 📰 Agri News | Categorized news: weather, market, schemes, disease alerts | ✅ |
| 🛒 Smart Market | 8+ product types with disease/crop-based recommendation | ✅ |
| 📊 Dashboard | Scan analytics, disease charts, recent history | ✅ |
| 🔐 Auth (JWT) | Secure registration, login, profile management | ✅ |
| 🌍 i18n | 8 Indian languages: English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati | ✅ |
| 📱 Mobile Responsive | Full mobile-first responsive design with Tailwind CSS | ✅ |

---

## 🧰 Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| **Python 3.10+** | Primary backend language |
| **Flask 3.0** | REST API framework |
| **PyTorch 2.3** | Deep learning model inference |
| **Flask-JWT-Extended** | Authentication & authorization |
| **SQLAlchemy + SQLite** | Database ORM (upgradeable to PostgreSQL) |
| **Open-Meteo API** | Free real-time weather (no API key needed) |
| **Groq API (Llama-3)** | LLM chatbot (free tier) |
| **NewsAPI** | Agricultural news aggregation |

### Frontend
| Tool | Purpose |
|---|---|
| **React 18** | UI library with hooks |
| **Vite** | Ultra-fast dev server & build |
| **Tailwind CSS 3** | Utility-first styling |
| **React Leaflet** | Interactive maps |
| **Recharts** | Data visualization / dashboard charts |
| **react-i18next** | Multi-language support |
| **Framer Motion** | Smooth animations |
| **Zustand** | Lightweight state management |

---

## 🏗️ Architecture

```
AgriVisionAI-Mega/
├── backend/
│   ├── app.py                  # Flask app + blueprint registration
│   ├── models/
│   │   └── models.py           # SQLAlchemy DB models
│   ├── routes/
│   │   ├── auth.py             # Register / Login / Profile (JWT)
│   │   ├── disease.py          # Image upload + CNN inference
│   │   ├── fertilizer.py       # Smart fertilizer recommendation
│   │   ├── weather.py          # Open-Meteo + crop suitability
│   │   ├── chatbot.py          # Groq LLM + rule-based fallback
│   │   ├── news.py             # NewsAPI + mock data
│   │   ├── market.py           # Product catalogue + filtering
│   │   ├── crop_map.py         # State-wise crop data API
│   │   └── dashboard.py        # Analytics & history endpoints
│   ├── ml_models/
│   │   ├── cnn.py              # CNN architecture definition
│   │   └── plant_disease_model_1_latest.pt   # ← Download separately
│   ├── data/
│   │   ├── disease_info.csv
│   │   └── supplement_info.csv
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Router + route definitions
│   │   ├── main.jsx            # React entry point
│   │   ├── i18n.js             # i18next setup
│   │   ├── index.css           # Tailwind + global styles
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Sidebar + topbar layout
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing / feature overview
│   │   │   ├── DiseaseDetect.jsx
│   │   │   ├── Fertilizer.jsx
│   │   │   ├── CropMap.jsx     # Leaflet interactive map
│   │   │   ├── Weather.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── News.jsx
│   │   │   ├── Market.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScanHistory.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   └── locales/
│   │       └── translations.js
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── README.md
├── .gitignore
└── docs/
    └── API_REFERENCE.md
```

---

## 🚀 Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Git

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ajinkyamane103/AgriVisionAI-Mega.git
cd AgriVisionAI-Mega
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure environment:**
```bash
cp .env.example .env
# Open .env and fill in your API keys (see below)
```

**Download the ML model:**
```
Download plant_disease_model_1_latest.pt from:
https://drive.google.com/drive/folders/1ewJWAiduGuld_9oGSrTuLumg9y62qS6A

Place it in: backend/ml_models/plant_disease_model_1_latest.pt
```

**Initialize database and run:**
```bash
python app.py
# Backend starts at http://localhost:5000
```

---

### Step 3 — Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already set)

# Start development server
npm run dev
# Frontend starts at http://localhost:3000
```

Open **http://localhost:3000** in your browser. 🎉

---

### Step 4 — Free API Keys

| Service | URL | Cost | Used For |
|---|---|---|---|
| **Groq** | https://console.groq.com | Free | AI Chatbot (Llama-3 70B) |
| **NewsAPI** | https://newsapi.org | Free (100 req/day) | Agricultural News |
| **Open-Meteo** | https://open-meteo.com | Completely Free | Weather Data |

Add keys to `backend/.env`.

---



## 📸 Screenshots

> _Add screenshots of your running application here_

| Page | Screenshot |
|---|---|
| Home Dashboard | `docs/screenshots/home.png` |
| Disease Detection | `docs/screenshots/detect.png` |
| Crop Map | `docs/screenshots/crop-map.png` |
| AgriBot Chat | `docs/screenshots/chatbot.png` |
| Fertilizer Advisor | `docs/screenshots/fertilizer.png` |

---

## Implementation Phases

### Phase 1 — Core (Completed)
- Plant disease detection CNN (39 classes)
- Fertilizer recommendation system
- Flask REST API + SQLite database
- Basic HTML/CSS frontend

### Phase 2 — Advanced Features (This Version)
- React + Tailwind complete frontend redesign
- JWT authentication system
- Interactive crop map (Leaflet.js)
- Live weather integration (Open-Meteo)
- Multilingual AI chatbot (Groq Llama-3)
- Agricultural news aggregation
- Smart marketplace with recommendations
- Farmer dashboard with analytics

### 🔮 Phase 3 — Scaling (Future)
- Fine-tune EfficientNetV2 on custom dataset
- Crop yield prediction ML model
- Mobile app (React Native / Flutter)
- WhatsApp bot integration (Twilio)
- PostgreSQL + Redis for production
- Docker containerization
- AWS/GCP deployment

---

## 🔭 Future Scope

1. **Drone Integration** — Aerial field monitoring via drone image processing
2. **Crop Yield Prediction** — ML regression model with historical weather + soil data
3. **IoT Sensor Dashboard** — Real-time soil moisture, temperature from field sensors
4. **WhatsApp Bot** — Farmers can send leaf photos on WhatsApp for diagnosis
5. **Mandi Price Integration** — Live AGMARKNET price feeds
6. **Offline Mode** — PWA with cached model for areas with poor connectivity
7. **Voice Interface** — Speech-to-text in Indian languages for illiterate farmers
8. **Satellite Imagery** — NDVI analysis from Sentinel-2 for crop health monitoring

---

## Discription

### Simple Description 
> "AgriVision AI is a web-based platform that uses artificial intelligence to help Indian farmers detect crop diseases from photos, get fertilizer recommendations, plan crops based on their location and weather, and get advice in their own language through a chatbot."

### Technical Description
> "AgriVision AI is a full-stack application with a React + Tailwind CSS frontend and Flask REST API backend. It uses a 4-layer Convolutional Neural Network trained on the PlantVillage dataset (87,000+ images, 39 classes) for disease detection. The fertilizer recommendation engine uses a rule-based system with soil-type adjustment factors. Weather data is fetched from Open-Meteo's free API. The multilingual chatbot uses Groq's Llama-3-70B via a REST API, with a rule-based fallback. All data is stored in SQLite via SQLAlchemy ORM with JWT-based authentication."

### Why This Is a Mega Project
1. **8 distinct AI/data features** integrated in one platform
2. **Multilingual** — 8 Indian languages
3. **Full-stack** — React frontend + Flask REST API
4. **Real APIs** — Open-Meteo weather, Groq LLM, NewsAPI
5. **Interactive map** — Leaflet.js with all 28 Indian states
6. **Authentication** — JWT-based user system with history tracking
7. **Mobile responsive** — works on all screen sizes
8. **Production-ready** — proper API design, error handling, env config

---


<div align="center">
⭐ If this project helped you, please give it a star on GitHub!
</div>
