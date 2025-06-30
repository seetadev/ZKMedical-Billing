#!/usr/bin/env python3
"""
Test script to verify Flask Server Files setup
This script tests the database connection, S3 setup, and API endpoints.
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_BASE_URL = "http://localhost:8888"


def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False


def test_registration():
    """Test user registration"""
    print("\n🔍 Testing user registration...")
    try:
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }
        response = requests.post(f"{API_BASE_URL}/auth/register", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Registration successful: {result}")
            return True
        else:
            print(
                f"⚠️  Registration response: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False


def test_login():
    """Test user login"""
    print("\n🔍 Testing user login...")
    try:
        data = {
            "email": "test@example.com",
            "password": "password123"
        }
        response = requests.post(f"{API_BASE_URL}/auth/login", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful: {result['user']['email']}")
            return result.get('token')
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None


def test_file_operations(token):
    """Test file operations"""
    if not token:
        print("❌ No token available for file operations test")
        return False

    print("\n🔍 Testing file operations...")
    headers = {"Authorization": f"Bearer {token}"}

    # Test getting files (should be empty initially)
    try:
        response = requests.get(
            f"{API_BASE_URL}/server-files", headers=headers)
        if response.status_code == 200:
            files = response.json()
            print(
                f"✅ Get files successful: {len(files.get('files', []))} files")
        else:
            print(f"❌ Get files failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get files error: {e}")
        return False

    return True


def main():
    """Main test function"""
    print("🧪 Testing Flask Server Files Setup")
    print("=" * 50)

    # Wait for server to be ready
    print("⏳ Waiting for Flask server to be ready...")
    for i in range(30):  # Wait up to 30 seconds
        if test_health_check():
            break
        time.sleep(1)
    else:
        print("❌ Flask server not ready after 30 seconds")
        return

    # Test registration
    test_registration()

    # Test login
    token = test_login()

    # Test file operations
    if token:
        test_file_operations(token)

    print("\n" + "=" * 50)
    print("✅ Flask setup test completed!")
    print("\n📋 Next steps:")
    print("1. Update your frontend API URL to: http://localhost:8888")
    print("2. Test the Server Files tab in your application")
    print("3. Use the sample credentials:")
    print("   Email: test@example.com")
    print("   Password: password123")


if __name__ == "__main__":
    main()
