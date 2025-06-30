#!/bin/bash

echo "🚀 Starting Flask Server Files API..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
python -c "
import time
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

while True:
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'stark_invoice'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres'),
            host=os.getenv('DB_HOST', 'db'),
            port=os.getenv('DB_PORT', '5432')
        )
        conn.close()
        print('✅ Database is ready!')
        break
    except psycopg2.OperationalError:
        print('⏳ Database not ready, retrying in 2 seconds...')
        time.sleep(2)
"

# Initialize database
echo "🔧 Initializing database..."
python setup_docker.py

# Start the Flask server
echo "🌐 Starting Flask server..."
python server.py 