from flask import Blueprint, request, jsonify
import hashlib
import jwt
import os
from services.database import cursor, conn
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get secret key from environment variable
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "your-secret-key-here-change-this-in-production")

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Hash the password for comparison
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Check if user exists and password matches
        cursor.execute(
            "SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s",
            (email, hashed_password)
        )
        user = cursor.fetchone()

        if user:
            # Generate JWT token
            payload = {
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

            return jsonify({
                "success": True,
                "token": token,
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email']
                }
            })
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return jsonify({"error": "Name, email and password are required"}), 400

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 400

        # Hash the password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Create new user
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (name, email, hashed_password)
        )
        result = cursor.fetchone()
        if result:
            user_id = result['id']
            conn.commit()
            return jsonify({
                "success": True,
                "message": "User registered successfully",
                "user_id": user_id
            })
        else:
            return jsonify({"error": "Failed to create user"}), 500

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
