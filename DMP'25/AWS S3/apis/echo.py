from flask import Blueprint, request, jsonify

echo_bp = Blueprint('echo', __name__)


@echo_bp.route('/', methods=['POST'])
def echo():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON"}), 400
        return jsonify({"you_sent": data})
    except Exception as e:
        return jsonify({"error": "Invalid JSON"}), 400
