from flask import Blueprint, send_file
from services.s3 import s3_client, BUCKET_NAME
from io import BytesIO

download_bp = Blueprint('download', __name__)


@download_bp.route('/<path:file_key>', methods=['GET'])
def download_file(file_key):
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_key)

        # Create BytesIO object for Flask send_file
        file_data = BytesIO(response['Body'].read())
        file_data.seek(0)

        name_splitter = file_key.split('-', 1)
        filename = name_splitter[1] if len(name_splitter) > 1 else file_key

        return send_file(
            file_data,
            mimetype=response['ContentType'],
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return {"error": str(e)}, 500
