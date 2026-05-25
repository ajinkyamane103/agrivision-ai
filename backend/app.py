"""
AgriVision AI - Mega Project Backend
Flask REST API - Fixed for macOS / all platforms
"""
import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, bcrypt, jwt

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def create_app():
    app = Flask(__name__)

    CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "agrivision-mega-secret-2024"),
        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "jwt-agrivision-secret"),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24),
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///agrivision.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), "static", "uploads"),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from routes.auth       import auth_bp
    from routes.disease    import disease_bp
    from routes.fertilizer import fertilizer_bp
    from routes.weather    import weather_bp
    from routes.chatbot    import chatbot_bp
    from routes.news       import news_bp
    from routes.market     import market_bp
    from routes.crop_map   import crop_map_bp
    from routes.dashboard  import dashboard_bp

    app.register_blueprint(auth_bp,       url_prefix="/api/auth")
    app.register_blueprint(disease_bp,    url_prefix="/api/disease")
    app.register_blueprint(fertilizer_bp, url_prefix="/api/fertilizer")
    app.register_blueprint(weather_bp,    url_prefix="/api/weather")
    app.register_blueprint(chatbot_bp,    url_prefix="/api/chatbot")
    app.register_blueprint(news_bp,       url_prefix="/api/news")
    app.register_blueprint(market_bp,     url_prefix="/api/market")
    app.register_blueprint(crop_map_bp,   url_prefix="/api/crop-map")
    app.register_blueprint(dashboard_bp,  url_prefix="/api/dashboard")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "version": "2.0.0", "project": "AgriVision AI Mega"})

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database tables created")

    print("🌿 AgriVision AI running")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
