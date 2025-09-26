#!/usr/bin/env python3
"""
Setup script for Docker environment
This script initializes the database and creates sample data for testing.
"""

import hashlib
import os
from services.database import cursor, conn
from services.s3 import ensure_bucket_exists
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def create_tables():
    """Create the necessary database tables"""

    print("Creating database tables...")

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

    # Create user_files table
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
    print("✅ Database tables created successfully!")


def create_sample_user():
    """Create a sample user for testing"""

    sample_user = {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'password123'
    }

    # Hash the password
    password_hash = hashlib.sha256(
        sample_user['password'].encode()).hexdigest()

    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = %s",
                   (sample_user['email'],))
    existing_user = cursor.fetchone()

    if existing_user:
        print(f"✅ Sample user already exists: {sample_user['email']}")
        return

    # Create new user
    cursor.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
        (sample_user['name'], sample_user['email'], password_hash)
    )
    result = cursor.fetchone()
    if result:
        user_id = result['id']
        conn.commit()
    else:
        print("❌ Failed to create sample user")
        return

    print(f"✅ Sample user created:")
    print(f"   ID: {user_id}")
    print(f"   Email: {sample_user['email']}")
    print(f"   Password: {sample_user['password']}")


def setup_s3():
    """Set up S3 bucket"""
    try:
        ensure_bucket_exists()
        print("✅ S3 setup completed!")
    except Exception as e:
        print(f"⚠️  S3 setup failed: {e}")
        print("   You can still use the application without S3 for testing")


def main():
    """Main setup function"""
    print("🚀 Setting up Flask Server Files for Docker environment...")
    print("=" * 50)

    # Create tables
    create_tables()

    print("\n" + "=" * 50)
    print("Creating sample user...")
    create_sample_user()

    print("\n" + "=" * 50)
    print("Setting up S3...")
    setup_s3()

    print("\n" + "=" * 50)
    print("✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start your Docker containers")
    print("2. The Flask server will be available at http://localhost:8888")
    print("3. Test authentication with:")
    print("   Email: test@example.com")
    print("   Password: password123")
    print("\n🔧 API Endpoints:")
    print("  POST /auth/login          - User login")
    print("  POST /auth/register       - User registration")
    print("  GET  /server-files        - List user files")
    print("  POST /server-files/upload - Upload file")
    print("  GET  /server-files/download/{id} - Download file")
    print("  DELETE /server-files/delete/{id} - Delete file")


if __name__ == "__main__":
    main()
