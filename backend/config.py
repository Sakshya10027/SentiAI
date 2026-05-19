import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ADMIN_USER = os.getenv("ADMIN_USER", "admin")
    ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")
    JWT_SECRET = os.getenv("JWT_SECRET", "default_secret")
    MODEL_PATH = os.getenv("MODEL_PATH", "models/isolation_forest.pkl")
    IPINFO_TOKEN = os.getenv("IPINFO_TOKEN", "")

settings = Settings()
