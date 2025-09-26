# 🌪️ Tornado Server - SocialCalc Invoice App

A powerful Tornado-based web server providing cloud storage, user authentication, file operations, and PDF generation capabilities.

## 📋 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🏗️ Project Architecture](#️-project-architecture)
- [🔧 Installation](#-installation)
- [🌐 API Documentation](#-api-documentation)
- [🛠️ Configuration](#️-configuration)
- [📁 Project Structure](#-project-structure)

## 🚀 Getting Started

This Tornado server provides a comprehensive backend solution for web applications with cloud storage integration, user management, and document processing capabilities.

### Prerequisites

- Python 3.8 or higher
- AWS S3 account (for cloud storage)
- wkhtmltopdf (for PDF generation)

## 🏗️ Project Architecture

The server is built with a modular architecture:

- **Authentication Module**: JWT-based user authentication and registration
- **Storage Module**: AWS S3 cloud storage integration
- **File Operations**: Upload, download, and manage user files
- **PDF Generation**: HTML to PDF conversion with wkhtmltopdf
- **Logo Management**: Image upload and serving for user logos

## 🔧 Installation

### Option 1: Direct Installation (Recommended)

Use the provided setup script for quick installation:

```bash
chmod +x run-direct.sh
./run-direct.sh
```

This script will:

- Create a Python virtual environment
- Install all dependencies
- Create a `.env` file with default configuration
- Start the Tornado server

### Option 2: Manual Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Tornado Server"
   ```

2. **Create virtual environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the server**
   ```bash
   python cloudmain.py
   ```

## 📖 API Documentation

Detailed documentation for each API endpoint is available in the `.github/docs/api/` directory:

- [📝 **User Login API**](.github/docs/api/login.md) - User authentication and JWT token generation
- [👤 **User Registration API**](.github/docs/api/register.md) - New user account creation
- [📁 **File Operations API**](.github/docs/api/fileops.md) - File upload, delete, and management
- [💾 **File Save API**](.github/docs/api/save.md) - Save/create text files on server
- [🎨 **Logo Upload API**](.github/docs/api/logos.md) - Upload and manage logo files
- [🖼️ **Logo Serve API**](.github/docs/api/logo-serve.md) - Serve uploaded logo files
- [📄 **Direct HTML to PDF API**](.github/docs/api/directhtmltopdf.md) - Convert HTML files to PDF with custom options

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
DEBUG=True
PORT=8080
HOST=0.0.0.0

# AWS Configuration (Required for cloud storage)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION="ap-south-1"
S3_BUCKET_NAME=your_s3_bucket_name_here

```

### Dependencies

Key dependencies include:

- **tornado>=6.0.0** - Web framework
- **boto3>=1.20.0** - AWS SDK for S3 storage
- **PyJWT>=2.0.0** - JWT token handling
- **pdfkit>=1.0.0** - PDF generation
- **beautifulsoup4>=4.9.0** - HTML parsing
- **cryptography>=3.4.8** - Security and encryption
- **passlib>=1.7.4** - Password hashing

## 📁 Project Structure

```
Tornado Server/
├── cloudmain.py              # Main application entry point
├── requirements.txt          # Python dependencies
├── run-direct.sh            # Setup and run script
├── .env.example             # Environment variables template
├── cloud/                   # Core application modules
│   ├── authenticate/        # User authentication
│   │   ├── user.py         # User model and authentication
│   │   └── authenticate.py  # Authentication utilities
│   └── storage/            # Cloud storage interface
│       └── storage.py      # AWS S3 storage operations
├── util/                   # Utility modules
│   ├── amazon_ses.py       # Email service
│   └── tickersymbols.py    # Stock ticker utilities
└── .github/               # Documentation
    └── docs/
        └── api/           # API documentation
            ├── login.md
            ├── register.md
            ├── fileops.md
            ├── save.md
            ├── logos.md
            ├── logo-serve.md
            └── directhtmltopdf.md
```

## 🚀 Usage Examples

### Starting the Server

```bash
# Using the setup script
./run-direct.sh

# Manual start
python cloudmain.py --port=8080
```

### Making API Calls

```javascript
// Login example
const response = await fetch('/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'email=user@example.com&password=yourpassword&react_app=true'
});

const data = await response.json();
console.log(data.token); // JWT token for authenticated requests
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with salt
- File type validation for uploads
- Request size limitations
- AWS S3 secure storage

## 🌟 Features

- ✅ User authentication and registration
- ✅ Cloud file storage with AWS S3
- ✅ Image upload and management
- ✅ HTML to PDF conversion
- ✅ RESTful API design
- ✅ JWT token authentication
- ✅ Cross-platform compatibility

**Made with ❤️ for C4GT@NSUT,Aspiring Investments**
