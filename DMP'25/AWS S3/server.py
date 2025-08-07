from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from apis.main import main_bp
from apis.user import user_bp
from apis.storage import storage_bp
from apis.upload import upload_bp
from apis.delete import delete_bp
from apis.download import download_bp
from apis.echo import echo_bp
from apis.auth import auth_bp
from apis.server_files import server_files_bp
from services.database import cursor, conn
from services.s3 import ensure_bucket_exists
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def create_app():
    app = Flask(__name__)

    # Disable Flask's default OPTIONS handling and trailing slash redirects
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.url_map.strict_slashes = False  # This prevents redirects for trailing slashes

    # Enable CORS with very permissive settings
    CORS(app,
         origins=["http://localhost:8100", "http://localhost:3000",
                  "http://localhost:8080", "*"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization",
                        "X-Requested-With", "Accept"],
         supports_credentials=True,
         max_age=3600)

    # Global OPTIONS handler - this MUST come before blueprint registration
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

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(storage_bp, url_prefix='/storage')
    app.register_blueprint(upload_bp, url_prefix='/upload')
    app.register_blueprint(delete_bp, url_prefix='/delete')
    app.register_blueprint(download_bp, url_prefix='/download')
    app.register_blueprint(echo_bp, url_prefix='/echo')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(server_files_bp, url_prefix='/server-files')

    return app


def init_database():
    """Initialize database tables"""
    # Create users table with password support
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create user_files table with proper schema
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_files (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create indexes for better performance
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id)")
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at)")

    conn.commit()


if __name__ == "__main__":
    # Initialize database
    init_database()

    # Ensure S3 bucket exists
    ensure_bucket_exists()

    # Create and run Flask app
    app = create_app()

    port = int(os.getenv('PORT', 8888))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'

    print("Server running on http://localhost:{}".format(port))
    print("Available endpoints:")
    print("  GET  /                    - Health check")
    print("  POST /auth/login          - User login")
    print("  POST /auth/register       - User registration")
    print("  GET  /server-files        - List user files")
    print("  POST /server-files/upload - Upload file")
    print("  GET  /server-files/download/{id} - Download file")
    print("  DELETE /server-files/delete/{id} - Delete file")

    app.run(host='0.0.0.0', port=port, debug=debug)
