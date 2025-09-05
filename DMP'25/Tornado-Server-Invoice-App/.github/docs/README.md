# 🌪️ Tornado Server Documentation

Welcome to the comprehensive documentation for the Tornado Server project. This documentation provides detailed information about installation, configuration, API usage, and development.

## 📚 Documentation Structure

### 🚀 Getting Started

- [Main README](../../README.md) - Project overview and quick start

### 🌐 API Documentation

- [Authentication APIs](./api/login.md) - User login and registration
- [File Management APIs](./api/fileops.md) - File upload, download, and management
- [Logo Management APIs](./api/logos.md) - Image upload and serving
- [PDF Generation APIs](./api/directhtmltopdf.md) - HTML to PDF conversion

## 🌟 Key Features Documentation

### Authentication System

- JWT-based authentication for modern applications
- Session-based authentication for traditional web apps
- User registration with password hashing
- Secure user data storage

**Documentation**: [Login API](./api/login.md) | [Register API](./api/register.md)

### File Management System

- Cloud storage integration with AWS S3
- Binary and text file support
- Metadata preservation
- User-isolated file access

**Documentation**: [File Operations API](./api/fileops.md) | [Save Handler API](./api/save.md)

### Image Management

- Logo upload and validation
- Multiple image format support
- Automatic image optimization
- Secure image serving

**Documentation**: [Logo Upload API](./api/logos.md) | [Logo Serve API](./api/logo-serve.md)

### PDF Generation

- HTML to PDF conversion
- External image processing
- Customizable PDF options
- Direct download or server storage

**Documentation**: [Direct HTML to PDF API](./api/directhtmltopdf.md)

## 🔧 Technical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  React Client   │    │  Mobile App     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Tornado Server  │
                    │   (Python)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS S3        │    │   wkhtmltopdf   │    │   User Auth     │
│ (File Storage)  │    │ (PDF Generation)│    │  (JWT/Session)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 API Quick Reference

| Category   | Endpoint           | Method          | Description            |
| ---------- | ------------------ | --------------- | ---------------------- |
| **Auth**   | `/login`           | POST            | User authentication    |
| **Auth**   | `/register`        | POST            | User registration      |
| **Files**  | `/fileops`         | GET/POST/DELETE | Modern file operations |
| **Files**  | `/save`            | GET/POST        | Legacy file operations |
| **Images** | `/logos`           | GET/POST        | Logo management        |
| **Images** | `/logos/{file}`    | GET             | Logo serving           |
| **PDF**    | `/directhtmltopdf` | POST            | Direct PDF download    |

## 🛠️ Development Workflow

### Setting Up Development Environment

1. Clone the repository
2. Run the setup script: `./run-direct.sh`
3. Configure environment variables
4. Start development server

## 🔐 Security Considerations

### Authentication

- JWT tokens with configurable expiration
- Password hashing with salt
- Session management for web apps

### File Security

- User-isolated file storage
- File type validation
- Size limitations
- Secure file serving

### Network Security

- HTTPS enforcement in production
- CORS configuration
- Request rate limiting
- Input validation and sanitization

## 📊 Monitoring and Logging

### Logging

- Configurable log levels
- Structured logging format
- Error tracking and reporting
- Performance metrics

### Health Checks

- Service health endpoints
- Database connectivity checks
- Storage system validation
- External service monitoring

## 🚀 Deployment Options

### Development

```bash
# Quick start
./run-direct.sh

# Manual start
python cloudmain.py --port=8080
```

### Production

- Docker containerization
- Load balancer configuration
- Environment-specific configuration
- Health monitoring setup

## 🆘 Troubleshooting

### Common Issues

1. **AWS Configuration**: Check credentials and S3 bucket access
2. **PDF Generation**: Ensure wkhtmltopdf is installed and configured
3. **Authentication**: Verify JWT secret and session configuration
4. **File Upload**: Check file size limits and storage permissions

## 📈 Performance Optimization

### Server Optimization

- Connection pooling
- Caching strategies
- Background task processing
- Resource optimization

### Client Optimization

- JWT token caching
- File upload chunking
- Image optimization
- API request batching

## 🔄 Updates and Maintenance

### Keeping Updated

- Regular dependency updates
- Security patch management
- Feature enhancement releases
- Documentation updates

### Backup and Recovery

- Database backup strategies
- File storage backup
- Configuration backup
- Disaster recovery planning

---

**📚 Choose a topic above to dive deeper into specific aspects of the Tornado Server documentation.**
