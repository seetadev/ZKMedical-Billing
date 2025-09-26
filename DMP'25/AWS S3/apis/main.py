from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)


@main_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Server Files API is running",
        "version": "1.0.0"
    })
