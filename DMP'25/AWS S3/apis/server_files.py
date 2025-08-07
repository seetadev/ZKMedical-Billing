from flask import Blueprint, request, jsonify, send_file
import jwt
import uuid
import os
from services.database import cursor, conn
from services.s3 import s3_client, BUCKET_NAME
from datetime import datetime
from dotenv import load_dotenv
from io import BytesIO

# Load environment variables
load_dotenv()

# Get secret key from environment variable
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "your-secret-key-here-change-this-in-production")

server_files_bp = Blueprint('server_files', __name__)


def get_user_from_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@server_files_bp.route('/', methods=['GET'])
def get_files():
    """Get all files for authenticated user"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(' ')[1]
        user_id = get_user_from_token(token)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Get user's files from database
        cursor.execute(
            "SELECT id, filename, s3_key, created_at, file_size FROM user_files WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        files = cursor.fetchall()

        # Convert to JSON serializable format
        files_list = []
        for file in files:
            files_list.append({
                'id': file['id'],
                'filename': file['filename'],
                's3_key': file['s3_key'],
                'created_at': file['created_at'].isoformat() if file['created_at'] else None,
                'file_size': file['file_size']
            })

        return jsonify({"files": files_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@server_files_bp.route('/upload', methods=['POST'])
def upload_file():
    """Upload a new file"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(' ')[1]
        user_id = get_user_from_token(token)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        file_name = file.filename
        file_content = file.read()
        content_type = file.content_type

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}-{file_name}"
        s3_key = f"user_{user_id}/{unique_filename}"

        # Upload to S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=content_type
        )

        # Save to database
        cursor.execute(
            "INSERT INTO user_files (user_id, filename, s3_key, file_size, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (user_id, file_name, s3_key, len(file_content), datetime.utcnow())
        )
        result = cursor.fetchone()
        if result:
            file_id = result['id']
            conn.commit()
        else:
            return jsonify({"error": "Failed to save file metadata"}), 500

        return jsonify({
            "success": True,
            "message": "File uploaded successfully",
            "file_id": file_id,
            "filename": file_name
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500


@server_files_bp.route('/download/<int:file_id>', methods=['GET'])
def download_file(file_id):
    """Download a specific file"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(' ')[1]
        user_id = get_user_from_token(token)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Get file info from database
        cursor.execute(
            "SELECT filename, s3_key FROM user_files WHERE id = %s AND user_id = %s",
            (file_id, user_id)
        )
        file_info = cursor.fetchone()

        if not file_info:
            return jsonify({"error": "File not found"}), 404

        # Download from S3
        response = s3_client.get_object(
            Bucket=BUCKET_NAME, Key=file_info['s3_key'])

        # Create BytesIO object for Flask send_file
        file_data = BytesIO(response['Body'].read())
        file_data.seek(0)

        return send_file(
            file_data,
            mimetype=response['ContentType'],
            as_attachment=True,
            download_name=file_info['filename']
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@server_files_bp.route('/delete/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a specific file"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(' ')[1]
        user_id = get_user_from_token(token)

        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Get file info from database
        cursor.execute(
            "SELECT s3_key FROM user_files WHERE id = %s AND user_id = %s",
            (file_id, user_id)
        )
        file_info = cursor.fetchone()

        if not file_info:
            return jsonify({"error": "File not found"}), 404

        # Delete from S3
        s3_client.delete_object(
            Bucket=BUCKET_NAME, Key=file_info['s3_key'])

        # Delete from database
        cursor.execute(
            "DELETE FROM user_files WHERE id = %s AND user_id = %s", (file_id, user_id))
        conn.commit()

        return jsonify({"success": True, "message": "File deleted successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
