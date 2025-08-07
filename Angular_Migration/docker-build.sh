#!/bin/bash

# Docker build script for Stark Invoice

echo "Setting up Docker build for Stark Invoice..."

# Check if .env exists, if not create it from .env.example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your actual environment variables before building!"
    echo "Required variables:"
    echo "  - VITE_STARKNET_RPC_URL"
    echo "  - VITE_PINATA_API_KEY"
    echo "  - VITE_PINATA_SECRET_KEY"
    echo "  - VITE_PINATA_GATEWAY"
    echo ""
    read -p "Press Enter to continue with default values or Ctrl+C to edit .env first..."
fi

# Build and run the application
echo "Building and starting Docker containers..."

# Production build
echo "Starting production build..."
docker-compose up --build -d

echo ""
echo "Build complete!"
echo "Access your application at:"
echo "  Production: http://localhost:3000"
echo ""
echo "To start development mode:"
echo "  docker-compose --profile dev up --build"
echo "  Development: http://localhost:3001"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
