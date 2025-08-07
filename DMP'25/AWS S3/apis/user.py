from flask import Blueprint, request, jsonify
from services.database import cursor, conn
from utils.validators import validate_input

user_bp = Blueprint('user', __name__)


@user_bp.route('/', methods=['GET'])
def get_users():
    cursor.execute("SELECT id, name, email FROM users")
    users = cursor.fetchall()
    return jsonify({"users": users})


@user_bp.route('/', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        valid, error = validate_input(data, ["name", "email"])
        if not valid:
            return jsonify({"error": error}), 400

        cursor.execute("INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id",
                       (data["name"], data["email"]))
        result = cursor.fetchone()
        if result:
            user_id = result["id"]
            conn.commit()
            return jsonify({"id": user_id, "message": "User created"})
        else:
            return jsonify({"error": "Failed to create user"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/', methods=['PUT'])
def update_user():
    try:
        data = request.get_json()
        valid, error = validate_input(data, ["id", "name", "email"])
        if not valid:
            return jsonify({"error": error}), 400

        cursor.execute("UPDATE users SET name=%s, email=%s WHERE id=%s",
                       (data["name"], data["email"], data["id"]))
        conn.commit()
        return jsonify({"message": "User updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
