from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    CORS(app, origins=config_class.CORS_ORIGINS, supports_credentials=True)
    JWTManager(app)
    db.init_app(app)

    # Blueprints
    from routes.auth_routes import auth_bp
    from routes.upload_routes import upload_bp
    from routes.quiz_routes import quiz_bp
    from routes.analytics_routes import analytics_bp
    from routes.content_routes import content_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(quiz_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(content_bp, url_prefix="/api")

    # Create tables
    with app.app_context():
        db.create_all()

    # Health check
    @app.route("/health")
    def health():
        return {"status": "ok", "service": "studyq-api"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
