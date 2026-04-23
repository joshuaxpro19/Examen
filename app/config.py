import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blog.db")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeyforblogplatformthatissecure12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

DEBUG = os.getenv("DEBUG", "true").lower() == "true"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000"
]