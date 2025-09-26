# Docker Setup Guide - Server Files Integration

## Overview

This guide helps you set up the Server Files functionality in your dockerized Stark Invoice application.

## Prerequisites

- Docker and Docker Compose installed
- AWS S3 bucket (optional, for file storage)
- PostgreSQL database (included in Docker setup)

## Quick Setup

### 1. Environment Configuration

Copy the environment template and configure it:

```bash
cd references
cp env.template .env
```

Edit `.env` with your actual values:

```bash
# Database Configuration (for Docker)
DB_HOST=db
DB_PORT=5432
DB_NAME=stark_invoice
DB_USER=postgres
DB_PASSWORD=postgres

# S3 Configuration (optional for testing)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=stark-invoice-files

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8888
DEBUG=True
AUTORELOAD=True
```

### 2. Install Dependencies

```bash
cd references
pip install -r requirements.txt
```

### 3. Initialize Database

```bash
python setup_docker.py
```

This will:

- Create the necessary database tables
- Create a sample user for testing
- Set up S3 bucket (if credentials are provided)

### 4. Start the Server

```bash
python server.py
```

The server will start on `http://localhost:8888`

## Docker Integration

### 1. Update Docker Compose

Add the following service to your `docker-compose.yml`:

```yaml
services:
  # ... your existing services ...

  server-files:
    build: ./references
    ports:
      - "8888:8888"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=stark_invoice
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - db
    volumes:
      - ./references:/app
    command: python server.py
```

### 2. Create Dockerfile

Create `references/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8888

# Run the application
CMD ["python", "server.py"]
```

### 3. Start Services

```bash
docker-compose up -d
```

## Frontend Integration

### 1. Update API URL

Edit `src/services/serverFiles.ts` and update the API URL:

```typescript
const API_BASE_URL = 'http://localhost:8888'; // Update with your Docker service URL
```

### 2. Update Files Component

Replace the existing `src/components/Files/Files.tsx` with the enhanced version that includes the Server Files tab.

## Testing

### 1. Test Authentication

1. Open your app and go to the Files page
2. Click on the "Server Files" tab
3. Use the sample credentials:
   - Email: `test@example.com`
   - Password: `password123`

### 2. Test File Operations

1. After logging in, click "Upload File"
2. Select a file and upload it
3. The file should appear in the list
4. Try downloading and deleting the file

## API Testing

### Health Check

```bash
curl http://localhost:8888/
```

### Login

```bash
curl -X POST http://localhost:8888/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Register New User

```bash
curl -X POST http://localhost:8888/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com","password":"password123"}'
```

### List Files (requires token)

```bash
curl -X GET http://localhost:8888/server-files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure PostgreSQL container is running
   - Check database credentials in `.env`
   - Verify network connectivity between containers

2. **Import Errors**

   - Make sure all dependencies are installed
   - Check Python version compatibility

3. **CORS Errors**

   - Add CORS headers to server configuration
   - Check frontend API URL matches Docker service

4. **S3 Errors**
   - Verify AWS credentials in `.env`
   - Check S3 bucket permissions
   - Ensure bucket exists in specified region

### Debug Mode

Set `DEBUG=True` in your `.env` file for detailed error messages.

### Logs

Check Docker logs for debugging:

```bash
docker-compose logs server-files
```

## Security Notes

### Production Deployment

- Change the JWT secret key
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Set up proper logging
- Use environment-specific configurations

### Environment Variables

- Never commit `.env` files to version control
- Use Docker secrets for sensitive data
- Rotate credentials regularly

## Sample User

The setup script creates a sample user:

- Email: `test@example.com`
- Password: `password123`

## Next Steps

1. Customize the UI to match your app's design
2. Add file type validation
3. Implement file sharing features
4. Add user management features
5. Set up production deployment with proper security

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs server-files`
2. Verify environment variables are set correctly
3. Test database connectivity
4. Validate S3 bucket access (if using S3)
