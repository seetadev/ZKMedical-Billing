from flask import Blueprint, request, jsonify
from services.s3 import s3_client, BUCKET_NAME
from services.database import cursor, conn

delete_bp = Blueprint('delete', __name__)


@delete_bp.route('/', methods=['POST'])
def delete_file():
    try:
        data = request.get_json()
        file_key = data.get('key') if data else request.form.get('key')

        if not file_key:
            return jsonify({"error": "File key is required"}), 400

        s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_key)
        cursor.execute("DELETE FROM user_files WHERE s3_key = %s", (file_key,))
        conn.commit()

        return jsonify({"success": True, "message": "File deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
