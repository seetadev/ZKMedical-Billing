#!/bin/bash

# Tornado Server Direct Setup (No Docker)
# This script sets up and runs the Tornado server directly on your system

echo "🌪️  Tornado Server Direct Setup"
echo "================================"

# Check if Python 3.12 is available
if command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Using Python: $($PYTHON_CMD --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
echo "🚀 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing requirements..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "❌ requirements.txt not found!"
    exit 1
fi

# Check if main file exists
if [ ! -f "cloudmain.py" ]; then
    echo "❌ cloudmain.py not found!"
    echo "Please ensure your main Tornado application file exists."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your actual configuration values"
    else
        echo "⚠️  No .env.example found. Creating basic .env..."
        cat > .env << EOF
DEBUG=True
PORT=8080
HOST=0.0.0.0
EOF
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "🌐 Starting Tornado server..."
echo "📍 Server will be available at: http://localhost:8080"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Run the server
python cloudmain.py
