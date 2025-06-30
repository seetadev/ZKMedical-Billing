from flask import Blueprint, request, jsonify
import uuid
from services.s3 import s3_client, BUCKET_NAME
from services.database import cursor, conn

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        file_name = file.filename
        file_content = file.read()
        content_type = file.content_type

        unique_filename = f"{uuid.uuid4()}-{file_name}"
        user_id = request.form.get('user_id')

        if user_id:
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"user_{user_id}/{unique_filename}",
                Body=file_content,
                ContentType=content_type
            )
            cursor.execute(
                "INSERT INTO user_files (user_id, filename, s3_key) VALUES (%s, %s, %s) RETURNING id",
                (user_id, file_name, unique_filename)
            )
            result = cursor.fetchone()
            if result:
                conn.commit()
                return jsonify({"success": True, "file_id": result['id'], "filename": file_name})
            else:
                return jsonify({"error": "Failed to save file metadata"}), 500
        else:
            return jsonify({"error": "User ID required"}), 400

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
