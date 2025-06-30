import psycopg2
from psycopg2.extras import RealDictCursor
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read DB config from environment variables
DB_NAME = os.getenv("DB_NAME", "test")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "db")  # Use "db" (not "localhost") in Docker
DB_PORT = os.getenv("DB_PORT", "5432")

# Try connecting with retries
while True:
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Connected to the database.")
        break
    except psycopg2.OperationalError as e:
        print("⏳ Database not ready. Retrying in 2 seconds...")
        print(str(e))
        time.sleep(2)
