from flask import Blueprint, jsonify
from services.s3 import s3_client, BUCKET_NAME

storage_bp = Blueprint('storage', __name__)


@storage_bp.route('/', methods=['GET'])
def get_storage_info():
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        files = []
        if 'Contents' in response:
            files = [
                {
                    'key': item['Key'],
                    'size': item['Size'],
                    'last_modified': item['LastModified'].strftime('%Y-%m-%d %H:%M:%S')
                }
                for item in response['Contents']
            ]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
