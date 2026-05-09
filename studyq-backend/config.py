import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "mysql+pymysql://root:@localhost:3306/studyq"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = False  # tokens don't expire (set timedelta for prod)

    # File uploads
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH_MB", 10)) * 1024 * 1024
    ALLOWED_EXTENSIONS = {"pdf"}

    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # CORS origins (comma-separated)
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:5174"
    ).split(",")
