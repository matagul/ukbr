import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ustakibris.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    VERSION = os.getenv("VERSION", "1.0.0")

settings = Settings()