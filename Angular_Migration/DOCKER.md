# Docker Setup for Stark Invoice

This document explains how to containerize and run the Stark Invoice application using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### 1. Setup Environment Variables

First, create your environment file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

Required environment variables:

- `VITE_STARKNET_RPC_URL` - Starknet RPC URL
- `VITE_PINATA_API_KEY` - Pinata IPFS API key
- `VITE_PINATA_SECRET_KEY` - Pinata IPFS secret key
- `VITE_PINATA_GATEWAY` - Pinata IPFS gateway URL

### 2. Build and Run

#### Using the Build Script (Recommended)

```bash
# Run the automated build script
./docker-build.sh
```

#### Manual Commands

```bash
# Production build
docker-compose up --build

# Development build with hot reload
docker-compose --profile dev up --build
```

### 3. Access the Application

- **Production**: http://localhost:3000
- **Development**: http://localhost:3001

## Detailed Commands

### Building Images

```bash
# Build production image only
docker build -t stark-invoice:prod .

# Build development image only
docker build -f Dockerfile.dev -t stark-invoice:dev .
```

### Running Containers

```bash
# Run production container directly
docker run -p 3000:80 stark-invoice:prod

# Run development container directly
docker run -p 3001:5173 -v $(pwd):/app -v /app/node_modules stark-invoice:dev
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start with build
docker-compose up --build

# Start in background
docker-compose up -d

# Start development profile
docker-compose --profile dev up

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Restart a specific service
docker-compose restart stark-invoice-app
```

## Environment Variables

You can customize the build by setting environment variables:

```bash
# Create .env file
NODE_ENV=production
REACT_APP_API_URL=https://your-api-url.com
REACT_APP_STARKNET_CHAIN=mainnet
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Set proper environment variables
2. **SSL/TLS**: Configure HTTPS with reverse proxy
3. **Domain**: Update nginx.conf with your domain
4. **Security**: Review and update security headers in nginx.conf

### Example with reverse proxy:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  stark-invoice-app:
    build: .
    container_name: stark-invoice
    expose:
      - "80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - stark-invoice-app
```

## Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Check what's using the port
   lsof -i :3000

   # Use different port
   docker-compose up -p 3002:80
   ```

2. **Build fails**:

   ```bash
   # Clear Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission issues (Linux)**:
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER .
   ```

### Logs and Debugging

```bash
# View container logs
docker-compose logs stark-invoice-app

# Access container shell
docker-compose exec stark-invoice-app sh

# View running containers
docker ps

# View images
docker images
```

## Performance Optimization

- The production build uses multi-stage Docker build for smaller image size
- Nginx is configured with gzip compression
- Static assets are cached for 1 year
- Only production dependencies are installed in final image

## Security Considerations

- Security headers are configured in nginx.conf
- Non-root user should be used in production
- Regular security updates for base images
- Environment variables for sensitive data
