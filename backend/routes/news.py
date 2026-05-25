"""Agricultural News Route - RSS feeds (no API key needed) + NewsAPI optional upgrade"""
import os, requests, xml.etree.ElementTree as ET
from datetime import datetime
from flask import Blueprint, request, jsonify

news_bp = Blueprint("news", __name__)

# Optional - if user has NewsAPI key it takes priority
NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")

# ---------------------------------------------------------------------------
# Free RSS feeds — no API key required, works immediately
# ---------------------------------------------------------------------------
RSS_FEEDS = {
    "general": [
        "https://www.thehindubusinessline.com/agriculture/?service=rss",
        "https://economictimes.indiatimes.com/industry/indl-goods/svs/agri/rssfeeds/13376022.cms",
        "https://www.downtoearth.org.in/rss/agriculture",
    ],
    "weather": [
        "https://economictimes.indiatimes.com/environment/rssfeeds/2647163.cms",
        "https://www.downtoearth.org.in/rss/climate-change",
        "https://timesofindia.indiatimes.com/rssfeeds/-2128932452.cms",
    ],
    "market": [
        "https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1808152121.cms",
        "https://www.thehindubusinessline.com/markets/commodities/?service=rss",
        "https://www.financialexpress.com/market/commodity/feed/",
    ],
    "schemes": [
        "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
        "https://www.krishijagran.com/government-schemes/rss",
        "https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/1017154991.cms",
    ],
    "disease": [
        "https://www.downtoearth.org.in/rss/agriculture",
        "https://www.krishijagran.com/crop-management/rss",
        "https://economictimes.indiatimes.com/industry/indl-goods/svs/agri/rssfeeds/13376022.cms",
    ],
}

CATEGORIES = {
    "weather":  ["weather forecast india agriculture", "monsoon india"],
    "market":   ["mandi price india crop", "agri commodity price india"],
    "schemes":  ["government scheme farmers india", "PM-KISAN PMFBY 2025"],
    "disease":  ["crop disease outbreak india 2025"],
    "general":  ["agriculture india news"],
}

# Fallback mock data (used only if all live sources fail)
MOCK_NEWS = [
    {"title": "IMD predicts above-normal monsoon 2025 for India", "category": "weather",
     "url": "https://imd.gov.in", "source": "IMD", "published_at": "2025-04-15",
     "description": "India Meteorological Department forecasts above-normal rainfall benefiting Kharif crops across India."},
    {"title": "Wheat MSP raised to Rs.2425/quintal for Rabi 2025-26", "category": "market",
     "url": "https://pib.gov.in", "source": "PIB", "published_at": "2025-04-10",
     "description": "Government raises minimum support price for wheat to support farmers ahead of the sowing season."},
    {"title": "PM-KISAN 19th installment released — Rs.6000 for eligible farmers", "category": "schemes",
     "url": "https://pmkisan.gov.in", "source": "Govt of India", "published_at": "2025-04-08",
     "description": "Over 9 crore farmers to receive PM-KISAN benefit directly into bank accounts."},
    {"title": "Fall Armyworm alert issued for Maharashtra and Karnataka maize fields", "category": "disease",
     "url": "https://icar.org.in", "source": "ICAR", "published_at": "2025-04-05",
     "description": "ICAR advises farmers to monitor maize crops and use recommended pesticides immediately."},
    {"title": "Onion prices stabilize at Nashik APMC after government intervention", "category": "market",
     "url": "https://agmarknet.gov.in", "source": "AGMARKNET", "published_at": "2025-04-03",
     "description": "Onion wholesale prices stabilized following buffer stock release by NAFED."},
    {"title": "Kisan Credit Card scheme — Rs.5 lakh limit extended to allied activities", "category": "schemes",
     "url": "https://nabard.org", "source": "NABARD", "published_at": "2025-04-01",
     "description": "NABARD extends KCC benefits to animal husbandry and fisheries with enhanced credit limit."},
    {"title": "Drone spraying subsidy: 40% for farmers, 50% for SC/ST in 2025-26", "category": "schemes",
     "url": "https://pib.gov.in", "source": "PIB", "published_at": "2025-03-28",
     "description": "Government announces expanded drone subsidy programme under Agriculture Mechanization scheme."},
    {"title": "Tomato Late Blight warning issued for Himachal Pradesh hill stations", "category": "disease",
     "url": "https://icar.org.in", "source": "ICAR", "published_at": "2025-03-25",
     "description": "ICAR-CPRI warns tomato growers to apply preventive fungicide sprays amid wet weather."},
    {"title": "Record cotton output of 325 lakh bales expected in 2024-25 season", "category": "general",
     "url": "https://cotcorp.gov.in", "source": "Cotton Corp", "published_at": "2025-03-20",
     "description": "Cotton Corporation of India estimates highest-ever production driven by improved variety adoption."},
    {"title": "e-NAM platform crosses 1 crore farmer registrations milestone", "category": "general",
     "url": "https://enam.gov.in", "source": "eNAM", "published_at": "2025-03-18",
     "description": "National Agriculture Market achieves landmark as digital mandi trading scales up nationwide."},
    {"title": "Soil Health Card 3.0 launched with AI-based fertilizer recommendations", "category": "schemes",
     "url": "https://soilhealth.dac.gov.in", "source": "DAC&FW", "published_at": "2025-03-15",
     "description": "New version integrates machine learning for personalized crop nutrition advice for farmers."},
    {"title": "Rice prices at Rs.3100/quintal in Punjab mandis — highest in 5 years", "category": "market",
     "url": "https://agmarknet.gov.in", "source": "AGMARKNET", "published_at": "2025-03-12",
     "description": "Paddy arrivals lower than expected pushing mandi prices to multi-year highs across Punjab."},
]


# ---------------------------------------------------------------------------
# RSS parsing helper
# ---------------------------------------------------------------------------
def _parse_rss(url: str, category: str, limit: int = 5) -> list:
    """Fetch and parse an RSS feed, return list of article dicts."""
    try:
        resp = requests.get(url, timeout=8, headers={"User-Agent": "AgriVisionAI/2.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        items = root.findall(".//item")
        articles = []
        for item in items[:limit]:
            title = (item.findtext("title") or "").strip()
            link  = (item.findtext("link")  or "").strip()
            pub   = (item.findtext("pubDate") or "").strip()
            desc  = (item.findtext("description") or "").strip()
            src_el = item.find("source")
            source = src_el.text if src_el is not None else url.split("/")[2]
            # Parse date safely
            pub_iso = pub
            for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S GMT"):
                try:
                    dt = datetime.strptime(pub, fmt)
                    pub_iso = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    break
                except Exception:
                    pass
            if title and link:
                articles.append({
                    "title": title,
                    "url": link,
                    "source": source,
                    "published_at": pub_iso,
                    "description": desc[:200] if desc else "",
                    "category": category,
                })
        return articles
    except Exception:
        return []


def _fetch_rss_news(category: str, max_articles: int = 10) -> list:
    """Try all RSS feeds for a category, collect up to max_articles."""
    feeds = RSS_FEEDS.get(category, RSS_FEEDS["general"])
    all_articles = []
    per_feed = max(4, max_articles // len(feeds) + 1)
    for feed_url in feeds:
        arts = _parse_rss(feed_url, category, per_feed)
        all_articles.extend(arts)
        if len(all_articles) >= max_articles:
            break
    return all_articles[:max_articles]


def _fetch_newsapi(category: str) -> list:
    """Fetch from NewsAPI (requires API key in NEWS_API_KEY env var)."""
    query = " OR ".join(CATEGORIES.get(category, CATEGORIES["general"]))
    url = "https://newsapi.org/v2/everything"
    params = {"q": query, "language": "en", "sortBy": "publishedAt",
              "pageSize": 10, "apiKey": NEWS_API_KEY}
    resp = requests.get(url, params=params, timeout=10)
    arts = resp.json().get("articles", [])
    return [
        {"title": a["title"], "url": a["url"],
         "source": a["source"]["name"], "published_at": a["publishedAt"],
         "description": (a.get("description") or "")[:200],
         "category": category}
        for a in arts if a.get("title") and a.get("url")
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@news_bp.get("/")
def get_news():
    category = request.args.get("category", "general")

    # Priority 1: NewsAPI (if key is configured)
    if NEWS_API_KEY:
        try:
            articles = _fetch_newsapi(category)
            if articles:
                return jsonify({"articles": articles, "source": "newsapi"})
        except Exception:
            pass

    # Priority 2: RSS feeds — free, no API key needed, works immediately
    try:
        articles = _fetch_rss_news(category, max_articles=10)
        if articles:
            return jsonify({"articles": articles, "source": "rss"})
    except Exception:
        pass

    # Priority 3: Mock fallback (always works)
    filtered = [n for n in MOCK_NEWS if category == "general" or n["category"] == category]
    return jsonify({"articles": filtered or MOCK_NEWS[:6], "source": "mock"})


@news_bp.get("/categories")
def categories():
    return jsonify(list(CATEGORIES.keys()))
