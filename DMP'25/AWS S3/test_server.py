#!/usr/bin/env python3
"""
Minimal test server to verify CORS configuration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Disable trailing slash redirects
app.url_map.strict_slashes = False

# Enable CORS with very permissive settings
CORS(app,
     origins=["http://localhost:8100", "http://localhost:3000",
              "http://localhost:8080", "*"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization",
                    "X-Requested-With", "Accept"],
     supports_credentials=True,
     max_age=3600)

# Global OPTIONS handler


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response


@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "CORS test server is running"})


@app.route('/server-files', methods=['GET'])
def test_server_files():
    return jsonify({"files": [], "message": "CORS test successful"})


@app.route('/auth/login', methods=['POST'])
def test_login():
    return jsonify({"success": True, "message": "CORS test successful"})


if __name__ == "__main__":
    print("🚀 Starting CORS test server on http://localhost:8888")
    print("Test with: curl -X OPTIONS http://localhost:8888/server-files")
    app.run(host='0.0.0.0', port=8888, debug=True)
