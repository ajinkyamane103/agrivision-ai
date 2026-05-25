"""
AI Chatbot for Farmers - multi-language agricultural assistant.
Uses Groq when configured and falls back to practical rule-based advice.
"""
import os
import uuid

import requests
from flask import Blueprint, jsonify, request

from extensions import db
from models.models import ChatMessage

chatbot_bp = Blueprint("chatbot", __name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "gu": "Gujarati",
}

SYSTEM_PROMPT = """You are AgriBot, an expert agricultural assistant helping Indian farmers.
Give practical, farmer-friendly, India-specific advice about crops, diseases,
fertilizer, pests, weather planning, markets, and government schemes.

Rules:
1. Reply in the same language as the user.
2. If the user writes Hinglish, reply in simple Hindi/Hinglish.
3. Keep answers concise and actionable.
4. Ask for state, soil type, water availability, and crop when needed.
5. For serious disease or pest damage, recommend the local KVK/agriculture officer.
"""

RULE_ANSWERS = {
    "en": {
        "general": (
            "To start farming, first choose a crop suitable for your soil, water, season, and local market. "
            "Do soil testing, prepare the field with compost or FYM, use certified seeds, plan irrigation, "
            "and monitor pests weekly. Tell me your state, soil type, and crop, and I can suggest a better plan."
        ),
        "fertilizer": (
            "Use fertilizer after soil testing. For many crops, FYM/compost plus balanced NPK works well. "
            "Avoid excess urea because it can increase pest and disease risk."
        ),
        "disease": (
            "Upload a clear leaf photo in Detect Disease. Remove badly infected leaves, avoid overhead watering, "
            "and contact your local KVK if the infection is spreading."
        ),
        "pest": (
            "Use IPM first: field inspection, yellow sticky traps, neem spray, and then crop-specific pesticide "
            "only at the label dose."
        ),
        "weather": "Check the 7-day forecast before sowing, spraying, or irrigation. Avoid pesticide spray before rain or strong wind.",
        "scheme": "Important schemes include PM-KISAN, PMFBY crop insurance, Kisan Credit Card, and eNAM/APMC market support.",
        "market": "Before sowing, check local APMC/eNAM demand and price trends. Choose crops with nearby buyers and manageable transport cost.",
        "organic": "Start with compost, vermicompost, green manure, neem cake, crop rotation, and bio-inputs like Trichoderma.",
    },
    "hi": {
        "general": (
            "खेती शुरू करने के लिए पहले अपनी जमीन, पानी, मौसम और बाजार के हिसाब से फसल चुनें। "
            "मिट्टी की जांच कराएं, खेत में गोबर खाद/कम्पोस्ट मिलाएं, अच्छी किस्म का बीज लें, "
            "सिंचाई की योजना बनाएं और हर हफ्ते कीट-रोग देखें। अपना राज्य, मिट्टी का प्रकार और कौन सी फसल लगानी है बताएंगे तो मैं सही योजना दे दूंगा।"
        ),
        "fertilizer": (
            "खाद मिट्टी जांच के बाद ही दें। सामान्य रूप से गोबर खाद/कम्पोस्ट के साथ संतुलित NPK उपयोग करें। "
            "यूरिया ज्यादा देने से कीट और रोग बढ़ सकते हैं।"
        ),
        "disease": (
            "रोग के लिए पत्ती की साफ फोटो Detect Disease में अपलोड करें। संक्रमित पत्तियां हटाएं, ऊपर से पानी न दें "
            "और ज्यादा नुकसान हो तो KVK/कृषि अधिकारी से सलाह लें।"
        ),
        "pest": "पहले IPM अपनाएं: खेत निरीक्षण, पीले चिपचिपे ट्रैप, नीम स्प्रे, फिर जरूरत हो तो फसल के अनुसार दवा सही मात्रा में दें।",
        "weather": "बुवाई, सिंचाई या स्प्रे से पहले 7 दिन का मौसम देखें। बारिश या तेज हवा से पहले कीटनाशक स्प्रे न करें।",
        "scheme": "मुख्य योजनाएं: PM-KISAN, PMFBY फसल बीमा, किसान क्रेडिट कार्ड और eNAM/APMC बाजार सुविधा।",
        "market": "फसल लगाने से पहले नजदीकी APMC/eNAM में मांग और भाव देखें। ऐसी फसल चुनें जिसका खरीदार पास में मिले।",
        "organic": "जैविक खेती के लिए कम्पोस्ट, वर्मी कम्पोस्ट, हरी खाद, नीम खली, फसल चक्र और Trichoderma जैसे जैविक इनपुट इस्तेमाल करें।",
    },
}

KEYWORDS = {
    "fertilizer": ("fertilizer", "khad", "khaad", "urea", "npk", "खाद", "उर्वरक", "यूरिया"),
    "disease": ("disease", "rog", "blight", "fungus", "leaf", "रोग", "बीमारी", "फफूंद", "पत्ती"),
    "pest": ("pest", "insect", "keet", "कीट", "मक्खी", "इल्ली"),
    "weather": ("weather", "rain", "monsoon", "mausam", "मौसम", "बारिश", "मानसून"),
    "scheme": ("scheme", "pm-kisan", "yojana", "kisan", "योजना", "पीएम", "किसान"),
    "market": ("market", "price", "mandi", "apmc", "भाव", "मंडी", "बाजार"),
    "organic": ("organic", "jaivik", "natural", "जैविक", "नेचुरल"),
    "general": ("farming", "farm", "kheti", "kaise kare", "start", "खेती", "कैसे", "शुरू"),
}

SMALL_TALK = {
    "en": {
        "greeting": "Hi! I am AgriBot. How can I help you with farming today?",
        "how_are_you": "I am doing well, thank you! I am ready to help you with crops, soil, fertilizer, weather, pests, or schemes.",
        "thanks": "You are welcome! Ask me anytime about farming, crops, fertilizer, disease, weather, or government schemes.",
        "bye": "Goodbye! Wishing you a healthy crop and good harvest.",
    },
    "hi": {
        "greeting": "नमस्ते! मैं AgriBot हूं। आज मैं आपकी खेती में कैसे मदद कर सकता हूं?",
        "how_are_you": "मैं ठीक हूं, धन्यवाद! आप बताइए, खेती, फसल, खाद, मौसम या रोग से जुड़ा कौन सा सवाल है?",
        "thanks": "आपका स्वागत है! खेती, फसल, खाद, रोग, मौसम या योजना से जुड़ा सवाल कभी भी पूछिए।",
        "bye": "ठीक है, फिर मिलते हैं। आपकी फसल अच्छी और स्वस्थ रहे!",
    },
}

SMALL_TALK_KEYWORDS = {
    "how_are_you": (
        "how are you", "how r u", "how are u", "kaise ho", "kese ho", "kaisa hai",
        "कैसे हो", "कैसे हैं", "तुम कैसे हो", "aap kaise ho", "ap kaise ho",
    ),
    "greeting": (
        "hi", "hello", "hey", "namaste", "namaskar", "नमस्ते", "नमस्कार", "हेलो",
    ),
    "thanks": (
        "thanks", "thank you", "dhanyawad", "shukriya", "धन्यवाद", "शुक्रिया",
    ),
    "bye": (
        "bye", "goodbye", "see you", "फिर मिलते", "अलविदा",
    ),
}


def _fallback_language(language: str) -> str:
    return "hi" if language in {"hi", "mr", "ta", "te", "kn", "bn", "gu"} else "en"


def get_groq_response(messages: list, language: str = "en") -> str | None:
    """Call Groq API for LLM response."""
    if not GROQ_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "system",
                "content": (
                    f"Reply in {LANGUAGE_NAMES.get(language, 'the user language')}. "
                    "If the user writes Hinglish, reply in simple Hindi/Hinglish."
                ),
            },
        ] + messages,
        "max_tokens": 500,
        "temperature": 0.7,
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as exc:
        print("GROQ ERROR:", exc)
        return None


def rule_based_answer(user_msg: str, language: str = "en") -> str:
    msg_lower = user_msg.lower()
    answers = RULE_ANSWERS[_fallback_language(language)]
    small_talk = SMALL_TALK[_fallback_language(language)]

    for intent, words in SMALL_TALK_KEYWORDS.items():
        if any(word in msg_lower for word in words):
            return small_talk[intent]

    for topic, words in KEYWORDS.items():
        if any(word in msg_lower for word in words):
            return answers.get(topic, answers["general"])

    return answers["general"]


@chatbot_bp.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    user_msg = data.get("message", "").strip()
    session_id = data.get("session_id") or str(uuid.uuid4())
    language = data.get("language", "en")

    if not user_msg:
        return jsonify({"error": "Empty message"}), 400

    history = ChatMessage.query.filter_by(session_id=session_id).order_by(
        ChatMessage.created_at
    ).all()[-10:]

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": user_msg})

    reply = get_groq_response(messages, language)
    source = "llm"
    if not reply:
        reply = rule_based_answer(user_msg, language)
        source = "rule_based"

    db.session.add(ChatMessage(session_id=session_id, role="user", content=user_msg, language=language))
    db.session.add(ChatMessage(session_id=session_id, role="assistant", content=reply, language=language))
    db.session.commit()

    return jsonify({
        "reply": reply,
        "session_id": session_id,
        "source": source,
        "language": language,
    })


@chatbot_bp.get("/history/<session_id>")
def chat_history(session_id):
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(
        ChatMessage.created_at
    ).all()
    return jsonify([{
        "role": m.role,
        "content": m.content,
        "created_at": m.created_at.isoformat(),
    } for m in messages])
