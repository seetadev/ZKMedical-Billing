# Invoice App Backend - Save to AWS S3 + PostgreSQL Authentication

A pure backend API built with Flask web framework that provides file storage capabilities using AWS S3, user authentication with PostgreSQL, and a complete file management system. This is a headless API designed to be consumed by frontend applications or mobile apps.

## 🚀 Features

- **File Management**: Upload, download, and delete files with AWS S3 integration
- **User Authentication**: JWT-based authentication with PostgreSQL user management
- **Database Storage**: PostgreSQL for user data and file metadata
- **Docker Support**: Complete containerization with Docker and Docker Compose
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **Health Checks**: Built-in health monitoring endpoints
- **Environment Configuration**: Flexible configuration via environment variables
- **RESTful API**: Clean REST endpoints for easy frontend integration

## 📁 Project Structure

```
AWS S3/
├── apis/                    # API endpoints (Flask blueprints)
│   ├── __init__.py
│   ├── auth.py              # Authentication endpoints
│   ├── delete.py            # File deletion handler
│   ├── download.py          # File download handler
│   ├── echo.py              # Echo/test endpoint
│   ├── main.py              # Main/health check handler
│   ├── server_files.py      # File management endpoints
│   ├── storage.py           # Storage information
│   ├── upload.py            # File upload handler
│   └── user.py              # User management
├── services/                # Business logic services
│   ├── database.py          # PostgreSQL connection and operations
│   └── s3.py               # AWS S3 operations
├── utils/                   # Utility functions
│   └── validators.py        # Input validation
├── docker-compose.yaml      # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
├── server.py              # Main application entry point
├── setup_docker.py        # Database initialization script
├── start.sh               # Startup script
└── test_setup.py          # Setup testing script
```

## 🛠️ Technology Stack

- **Backend Framework**: Flask (Python)
- **Database**: PostgreSQL
- **Cloud Storage**: AWS S3
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker & Docker Compose
- **Environment Management**: python-dotenv
- **CORS**: Flask-CORS

## 📋 Prerequisites

- Python 3.9+
- Docker and Docker Compose
- AWS Account with S3 access
- PostgreSQL (if running locally)

## 🔧 Installation & Setup

### Option 1: Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "AWS S3"
   ```

2. **Set up environment variables**

   ```bash
   cp env.template .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Database Configuration
   DB_HOST=db
   DB_PORT=5432
   DB_NAME=stark_invoice
   DB_USER=postgres
   DB_PASSWORD=postgres

   # S3 Configuration
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

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

### Option 2: Local Development

1. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database**

   - Install PostgreSQL
   - Create a database named `stark_invoice`
   - Update `.env` file with local database credentials

3. **Configure AWS S3**

   - Create an S3 bucket
   - Configure AWS credentials
   - Update `.env` file with S3 configuration

4. **Run the application**
   ```bash
   python server.py
   ```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### File Management

- `GET /server-files` - List user files
- `POST /server-files/upload` - Upload file
- `GET /server-files/download/{id}` - Download file
- `DELETE /server-files/delete/{id}` - Delete file

### System

- `GET /` - Health check
- `GET /echo` - Echo endpoint for testing

## 📖 API Usage Examples

### User Registration

```bash
curl -X POST http://localhost:8888/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### User Login

```bash
curl -X POST http://localhost:8888/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Upload File

```bash
curl -X POST http://localhost:8888/server-files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

### List Files

```bash
curl -X GET http://localhost:8888/server-files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download File

```bash
curl -X GET http://localhost:8888/server-files/download/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output downloaded_file.pdf
```

### Delete File

```bash
curl -X DELETE http://localhost:8888/server-files/delete/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Request data validation
- **Environment Variables**: Secure configuration management

## 🐳 Docker Configuration

The application includes:

- **Multi-container setup** with PostgreSQL database
- **Health checks** for service monitoring
- **Volume persistence** for database data
- **Environment variable** configuration
- **Automatic database initialization**

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Files Table

```sql
CREATE TABLE user_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Update all sensitive values in production
2. **JWT Secret**: Use a strong, unique JWT secret key
3. **Database**: Use production-grade PostgreSQL instance
4. **S3 Bucket**: Configure proper S3 bucket permissions
5. **SSL/TLS**: Enable HTTPS in production
6. **Monitoring**: Set up application monitoring and logging

### Scaling

- The application can be scaled horizontally using load balancers
- Database connection pooling can be configured
- S3 provides unlimited storage scalability

```bash
python test_setup.py
```

## 📝 Environment Variables

| Variable                | Description            | Default               |
| ----------------------- | ---------------------- | --------------------- |
| `DB_HOST`               | Database host          | `db`                  |
| `DB_PORT`               | Database port          | `5432`                |
| `DB_NAME`               | Database name          | `stark_invoice`       |
| `DB_USER`               | Database user          | `postgres`            |
| `DB_PASSWORD`           | Database password      | `postgres`            |
| `AWS_ACCESS_KEY_ID`     | AWS access key         | Required              |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key         | Required              |
| `AWS_REGION`            | AWS region             | `us-east-1`           |
| `S3_BUCKET_NAME`        | S3 bucket name         | `stark-invoice-files` |
| `JWT_SECRET_KEY`        | JWT signing key        | Required              |
| `PORT`                  | Server port            | `8888`                |
| `DEBUG`                 | Debug mode             | `True`                |
| `AUTORELOAD`            | Auto-reload on changes | `True`                |

---

**Note**: Make sure to replace placeholder values (like AWS credentials, JWT secrets) with your actual production values before deploying.
