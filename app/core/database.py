import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in .env")

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=10000,
)

db = client["trustguard"]

users_collection = db["users"]
history_collection = db["history"]


def test_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False