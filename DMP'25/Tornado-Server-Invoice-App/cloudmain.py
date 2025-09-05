#!/usr/bin/env python
#
# Aspiring Investments
#
#
#
#

import codecs
import subprocess
import logging
import os.path
import re
import jwt
import io
import tempfile
import os
import base64
from datetime import datetime, timedelta
import requests
import mimetypes
from urllib.parse import urljoin, urlparse
# import tornado.database
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.escape
import unicodedata

import random
import string
import uuid
import imghdr
import mimetypes

import json
import cloud.storage.storage
import cloud.authenticate.user

try:
    import pdfkit
    from bs4 import BeautifulSoup
    PDFKIT_AVAILABLE = True
except ImportError:
    PDFKIT_AVAILABLE = False
    BeautifulSoup = None
    pdfkit = None

from tornado.options import define, options
from util.amazon_ses import AmazonSES, EmailMessage
import util.tickersymbols

from collections import namedtuple
import urllib.parse
import dropbox
# import memcache
from datetime import datetime, timedelta
import time
import base64
JWT_SECRET = "your-secret-key-change-this-in-production"  # Change this!
JWT_ALGORITHM = "HS256"
channels = {}

# PDF Configuration
PDF_OPTIONS = {
    'page-size': 'A4',
    'margin-top': '0.75in',
    'margin-right': '0.75in',
    'margin-bottom': '0.75in',
    'margin-left': '0.75in',
    'encoding': "UTF-8",
    'no-outline': None,
    'enable-local-file-access': None,
    # Network safety options to prevent hanging
    'load-error-handling': 'ignore',
    'load-media-error-handling': 'ignore',
    'javascript-delay': '1000',  # Wait max 1 second for JS
    'no-stop-slow-scripts': None,
    'debug-javascript': None
}


def get_wkhtmltopdf_config():
    """Get wkhtmltopdf configuration based on available installation"""
    try:

        possible_paths = [
            '/usr/local/bin/wkhtmltopdf',
            '/usr/bin/wkhtmltopdf',
            '/usr/local/bin/wkhtmltopdf.sh',
            'wkhtmltopdf'
        ]

        for path in possible_paths:
            try:
                if os.path.exists(path):
                    if PDFKIT_AVAILABLE:
                        return pdfkit.configuration(wkhtmltopdf=path)
                    else:
                        return path
                elif subprocess.call(['which', path.split('/')[-1]],
                                     stdout=subprocess.DEVNULL,
                                     stderr=subprocess.DEVNULL) == 0:
                    if PDFKIT_AVAILABLE:
                        return pdfkit.configuration(wkhtmltopdf=path)
                    else:
                        return path
            except Exception:
                continue

        try:
            result = subprocess.run(['which', 'wkhtmltopdf'],
                                    capture_output=True, text=True)
            if result.returncode == 0:
                path = result.stdout.strip()
                if PDFKIT_AVAILABLE:
                    return pdfkit.configuration(wkhtmltopdf=path)
                else:
                    return path
        except Exception:
            pass

        return None
    except Exception as e:
        logging.error(f"Error finding wkhtmltopdf: {e}")
        return None


define("port", default=8080, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/save", SaveHandler),
            (r"/fileops", FileOpsHandler),
            (r"/directhtmltopdf", DirectHtmlToPdfHandler),
            (r"/logos", LogosHandler),
            (r"/logos/([^/]+)", LogoServeHandler),
            (r"/login", UserLoginHandler),
            (r"/register", UserRegisterHandler),
        ]
        settings = dict(
            app_title="Aspiring Investments",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            util_path=os.path.join(os.path.dirname(__file__), "util"),
            cloud_path=os.path.join(os.path.dirname(__file__), "cloud"),
            xsrf_cookies=False,
            cookie_secret="11oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
            login_url="/"
        )
        tornado.web.Application.__init__(self, handlers, **settings)

        try:
            data = open("credentials").read()
            args = data.split("\n")

            self.amazonSes = AmazonSES(args[0], args[1])
            self.fromemail = 'aspiring.FileUploadHandlerinvestments@gmail.com'
        except:
            self.amazonSes = None
            self.fromemail = ""

        self.db = None
        # self.db = tornado.database.Connection(
        #    host=options.mysql_host, database=options.mysql_database,
        #    user=options.mysql_user, password=options.mysql_password)
        # self.mc = memcache.Client(['127.0.0.1'], debug=0)


class BaseHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        """Set CORS headers for all requests"""
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers",
                        "Origin, X-Requested-With, Content-Type, Accept, Authorization")
        self.set_header("Access-Control-Allow-Methods",
                        "GET, POST, PUT, DELETE, OPTIONS")
        self.set_header("Access-Control-Allow-Credentials", "true")

    def options(self, *args, **kwargs):
        """Handle CORS preflight requests"""
        self.set_status(204)
        self.finish()

    @property
    def db(self):
        return self.application.db

    def get_current_user(self):
        """Get current user from JWT token or cookie"""
        auth_header = self.request.headers.get('Authorization')
        if auth_header:
            try:
                # Extract token from "Bearer <token>" format
                token = auth_header.split(' ')[1] if auth_header.startswith(
                    'Bearer ') else auth_header
                payload = jwt.decode(
                    token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                return payload.get('user')
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError):
                return None

        # Fallback to cookie for backward compatibility
        user_json = self.get_secure_cookie("user")
        if user_json:
            return tornado.escape.json_decode(user_json)
        return None

    def set_current_user(self, user):
        if user:
            self.set_secure_cookie("user", tornado.escape.json_encode(user))
        else:
            self.clear_cookie("user")

    def generate_jwt_token(self, user):
        """Generate JWT token for user"""
        payload = {
            'user': user,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class UserLoginHandler(BaseHandler):
    def get(self):
        # send the login/pw page
        argument = {}
        self.clear_cookie("user")
        argument['user'] = None
        self.render("userlogin.html", argument=argument)

    def post(self):
        # verify user login
        user = self.get_argument('email')
        password = self.get_argument('password')
        # Check if it's a React app
        react_app = self.get_argument('react_app', None)

        if cloud.authenticate.user.authenticate_user(user, password):
            print("authenticate succeeded")

            if react_app:
                # Generate JWT token for React app
                token = self.generate_jwt_token(user)
                self.finish({
                    "success": True,
                    "message": "Login successful",
                    "user": user,
                    "token": token,
                    "redirect": "/save"
                })
            else:
                # Traditional cookie-based auth for web app
                self.set_current_user(user)
                self.redirect("/save")
        else:
            logging.info("authenticate failed")
            if react_app:
                self.set_status(401)
                self.finish({
                    "success": False,
                    "error": "INVALID_CREDENTIALS",
                    "message": "Invalid email or password"
                })
            else:
                self.redirect("/login")


class UserRegisterHandler(BaseHandler):
    def get(self):
        # send the login/pw page
        self.clear_cookie("user")
        argument = {}
        argument['user'] = None
        self.render("userregister.html", argument=argument)

    def post(self):
        user = self.get_argument('email')
        password = self.get_argument('password')
        # Check if it's a React app
        react_app = self.get_argument('react_app', None)

        logging.info(f"Registration attempt for user: {user}")
        logging.info(f"React app: {react_app}")

        if cloud.authenticate.user.user_exists(user):
            # user already exists
            if react_app:
                # Return JSON response for React apps
                self.set_status(409)  # Conflict status
                self.finish({
                    "success": False,
                    "error": "USER_EXISTS",
                    "message": "User already exists",
                    "user": user
                })
            else:
                # Traditional HTML response
                argument = {}
                argument['user'] = None
                argument['reguser'] = user
                self.render("userregister-exists.html", argument=argument)
            return

        cloud.authenticate.user.create_user(user, password)

        if react_app:
            # Return Registration success response for React apps
            self.finish({
                "success": True,
                "message": "User registered successfully",
                "user": user
            })
        else:
            # Traditional cookie-based auth for web app
            self.set_current_user(user)
            argument = {}
            argument['user'] = user
            self.render("userregister-ok.html", argument=argument)


class SaveHandler(BaseHandler):
    def get(self):
        # display all sheets
        user = self.get_current_user()
        if user == None:
            # this cannot happen
            self.redirect("/dev")
            return
        path = ["home", user]
        dirobj = cloud.storage.storage.getFile(path)
        if (not dirobj) or (len(dirobj.files) == 0):
            logging.info("no directory")
            cloud.storage.storage.createDir(path)
            filedata = {}
            filedata["user"] = user
            filedata["fname"] = "default"
            filedata["data"] = "\n"
            fpath = path[:]
            fpath.append("default")
            logging.info(fpath)
            cloud.storage.storage.createFile(fpath, json.dumps(filedata))
            dirobj = cloud.storage.storage.getFile(path)
        entries = dirobj.files
        logging.info(entries)
        argument = {}
        argument['user'] = self.get_current_user()
        logging.info("done")
        argument['entries'] = entries
        logging.info(str(argument['entries']))
        self.render("allusersheets.html", argument=argument)

    def post(self):
        user = self.get_current_user()
        if user == None:
            # this cannot happen
            self.redirect("/dev")
            return
        fname = self.get_argument('fname')
        logging.info("fname is "+fname)
        sheetstr = self.get_argument("data", None)
        path = ["home", user, fname]
        if sheetstr != None:
            fileobj = cloud.storage.storage.getFile(path)
            if fileobj == None:
                cloud.storage.storage.createFile(path, sheetstr)
            else:
                cloud.storage.storage.updateFile(path, sheetstr)
        self.finish(dict(data="Done"))


# For React-app save and retrieve:

class FileOpsHandler(BaseHandler):

    def get(self):
        """Get list of user files or download a specific file"""
        user = self.get_current_user()
        if user is None:
            self.set_status(401)
            self.finish({"error": "Authentication required"})
            return

        # Check if filename is provided for download
        filename = self.get_argument('filename', None)

        if filename:
            # Download specific file
            try:
                user_path = ["home", user]
                file_path = user_path + [filename]

                # Use fetchFile function from storage
                file_content = cloud.storage.storage.fetchFile(file_path)

                if file_content is None:
                    self.set_status(404)
                    self.finish({"error": "File not found"})
                    return

                # Parse file content to get metadata and actual content
                try:
                    file_data = json.loads(file_content)
                    if "metadata" in file_data and "content" in file_data:
                        metadata = file_data["metadata"]
                        content = file_data["content"]

                        # Handle different encodings
                        if metadata.get("encoding") == "base64":
                            # Decode base64 content
                            actual_content = base64.b64decode(content)
                            content_type = metadata.get(
                                "content_type", "application/octet-stream")
                        else:
                            # Text content
                            actual_content = content.encode(
                                'utf-8') if isinstance(content, str) else content
                            content_type = metadata.get(
                                "content_type", "text/plain")

                        # Set appropriate headers
                        self.set_header("Content-Type", content_type)
                        self.set_header("Content-Disposition",
                                        f'attachment; filename="{filename}"')
                        self.set_header("Content-Length",
                                        str(len(actual_content)))

                        self.write(actual_content)
                        self.finish()
                        return
                    else:
                        # Legacy file format - return as text
                        self.set_header("Content-Type", "text/plain")
                        self.set_header("Content-Disposition",
                                        f'attachment; filename="{filename}"')
                        self.write(file_content.encode('utf-8'))
                        self.finish()
                        return

                except json.JSONDecodeError:
                    # Raw file content
                    self.set_header("Content-Type", "application/octet-stream")
                    self.set_header("Content-Disposition",
                                    f'attachment; filename="{filename}"')
                    content_bytes = file_content.encode(
                        'utf-8') if isinstance(file_content, str) else file_content
                    self.write(content_bytes)
                    self.finish()
                    return

            except Exception as e:
                logging.error(f"Error downloading file: {e}")
                self.set_status(500)
                self.finish({"error": "Internal server error"})
                return

        # If no filename provided, return file list (existing functionality)
        try:
            # Get user directory
            user_path = ["home", user]
            dirobj = cloud.storage.storage.getFile(user_path)

            if not dirobj:
                self.finish({"files": []})
                return

            files = []
            for file_obj in dirobj.files:
                filename = file_obj.fname
                file_path = user_path + [filename]
                file_data = cloud.storage.storage.getFile(file_path)

                if file_data and hasattr(file_data, 'data'):
                    try:
                        file_json = json.loads(file_data.data)
                        if "metadata" in file_json:
                            metadata = file_json["metadata"]
                            files.append({
                                "id": hash(filename),
                                "filename": metadata.get("filename", filename),
                                "s3_key": metadata.get("s3_key", ""),
                                "created_at": metadata.get("created_at", ""),
                                "file_size": metadata.get("file_size", 0)
                            })
                        else:
                            # Handle legacy files without metadata
                            files.append({
                                "id": hash(filename),
                                "filename": filename,
                                "s3_key": cloud.storage.storage.pathToString(file_path),
                                "created_at": datetime.utcnow().isoformat(),
                                "file_size": len(file_data.data) if file_data.data else 0
                            })
                    except (json.JSONDecodeError, AttributeError):
                        # Handle corrupted or invalid data
                        continue

            self.finish({"files": files})

        except Exception as e:
            logging.error(f"Error retrieving files: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})

    def post(self):
        """Upload file to S3 storage"""
        user = self.get_current_user()
        if user is None:
            self.set_status(401)
            self.finish({"error": "Authentication required"})
            return

        try:
            # Get uploaded file from request
            file_info = self.request.files.get('file')
            if not file_info:
                self.set_status(400)
                self.finish({"error": "No file provided"})
                return

            file_data = file_info[0]
            filename = file_data['filename']
            file_content = file_data['body']

            # Validate filename
            if not filename or filename.strip() == '':
                self.set_status(400)
                self.finish({"error": "Invalid filename"})
                return

            # Create user directory if it doesn't exist
            user_path = ["home", user]
            dirobj = cloud.storage.storage.getFile(user_path)
            if not dirobj:
                cloud.storage.storage.createDir(user_path)

            # Create file path
            file_path = user_path + [filename]

            # Check if file already exists
            existing_file = cloud.storage.storage.getFile(file_path)
            if existing_file:
                self.set_status(409)
                self.finish({"error": "File already exists"})
                return

            # Create file metadata
            file_metadata = {
                "filename": filename,
                "file_size": len(file_content),
                "created_at": datetime.utcnow().isoformat(),
                "s3_key": cloud.storage.storage.pathToString(file_path),
                "content_type": file_data.get('content_type', 'application/octet-stream')
            }

            # Encode file content for storage
            if isinstance(file_content, bytes):
                encoded_content = base64.b64encode(
                    file_content).decode('utf-8')
                file_metadata["encoding"] = "base64"
            else:
                encoded_content = file_content
                file_metadata["encoding"] = "text"

            # Store file with metadata
            file_data_with_meta = {
                "metadata": file_metadata,
                "content": encoded_content
            }

            # Create file in storage
            success = cloud.storage.storage.createFile(
                file_path, json.dumps(file_data_with_meta))

            if success:
                self.finish({
                    "success": True,
                    "message": "File uploaded successfully",
                    "file_id": hash(filename),  # Simple ID generation
                    "filename": filename
                })
            else:
                self.set_status(500)
                self.finish({"error": "Failed to upload file"})

        except Exception as e:
            logging.error(f"Error uploading file: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})

    def delete(self):
        """Delete a specific file"""
        user = self.get_current_user()
        if user is None:
            self.set_status(401)
            self.finish({"error": "Authentication required"})
            return

        try:
            # Get filename from query parameter
            filename = self.get_argument('filename', None)

            if not filename:
                self.set_status(400)
                self.finish({"error": "Filename parameter is required"})
                return

            # Validate filename
            if not filename or filename.strip() == '':
                self.set_status(400)
                self.finish({"error": "Invalid filename"})
                return

            # Create file path
            user_path = ["home", user]
            file_path = user_path + [filename]

            # Check if file exists
            existing_file = cloud.storage.storage.getFile(file_path)
            if not existing_file:
                self.set_status(404)
                self.finish({"error": "File not found"})
                return

            # Delete the file
            success = cloud.storage.storage.deleteFile(file_path)

            if success:
                self.finish({
                    "success": True,
                    "message": f"File '{filename}' deleted successfully"
                })
            else:
                self.set_status(500)
                self.finish({"error": "Failed to delete file"})

        except Exception as e:
            logging.error(f"Error deleting file: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})


class LogosHandler(BaseHandler):

    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    def validate_image_file(self, file_data, filename):
        """Validate if the uploaded file is a valid image"""
        try:
            # Check file extension
            if '.' not in filename:
                return False

            extension = filename.rsplit('.', 1)[1].lower()
            if extension not in self.ALLOWED_EXTENSIONS:
                return False

            # Use imghdr to verify image format for most formats
            if extension != 'svg':  # imghdr doesn't support SVG
                image_type = imghdr.what(None, h=file_data)
                if image_type is None:
                    return False
            else:
                # Basic SVG validation - check if it starts with SVG content
                try:
                    content_str = file_data.decode('utf-8', errors='ignore')
                    if not ('<svg' in content_str.lower() or '<?xml' in content_str.lower()):
                        return False
                except:
                    return False

            return True
        except Exception as e:
            logging.error(f"Error validating image file: {e}")
            return False

    def get(self):
        """Get all logos for authenticated user"""
        try:
            user = self.get_current_user()
            if user is None:
                self.set_status(401)
                self.finish({"error": "Authentication required"})
                return

            # Get user's logos directory
            logos_path = ["home", user, "logos"]
            dirobj = cloud.storage.storage.getFile(logos_path)

            if not dirobj:
                # No logos directory exists, return empty list
                self.finish({
                    "success": True,
                    "logos": []
                })
                return

            logos = []
            for file_obj in dirobj.files:
                filename = file_obj.fname
                file_path = logos_path + [filename]
                file_data = cloud.storage.storage.getFile(file_path)

                if file_data and hasattr(file_data, 'data'):
                    try:
                        file_json = json.loads(file_data.data)
                        if "metadata" in file_json:
                            metadata = file_json["metadata"]
                            # Use the public_filename for the URL
                            public_filename = metadata.get(
                                "public_filename", filename)
                            logos.append({
                                "id": hash(filename),  # Simple ID generation
                                "filename": metadata.get("original_filename", filename),
                                # Public URL without username
                                "logo_url": f"/logos/{public_filename}",
                                "file_size": metadata.get("file_size", 0),
                                "content_type": metadata.get("content_type", ""),
                                "created_at": metadata.get("created_at", "")
                            })
                    except (json.JSONDecodeError, AttributeError):
                        # Handle corrupted or invalid data
                        continue

            self.finish({
                "success": True,
                "logos": logos
            })

        except Exception as e:
            logging.error(f"Error retrieving logos: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})

    def post(self):
        """Upload a logo for authenticated user"""
        try:
            user = self.get_current_user()
            if user is None:
                self.set_status(401)
                self.finish({"error": "Authentication required"})
                return

            # Get uploaded file from request
            file_info = self.request.files.get('logo')
            if not file_info:
                self.set_status(400)
                self.finish({"error": "No logo file provided"})
                return

            file_data = file_info[0]
            original_filename = file_data['filename']
            file_content = file_data['body']

            # Validate filename
            if not original_filename or original_filename.strip() == '':
                self.set_status(400)
                self.finish({"error": "No file selected"})
                return

            # Validate file is an image
            if not self.validate_image_file(file_content, original_filename):
                self.set_status(400)
                self.finish(
                    {"error": "Invalid file type. Only images are allowed (PNG, JPG, JPEG, GIF, WebP, SVG)"})
                return

            # Check file size (max 5MB)
            if len(file_content) > self.MAX_FILE_SIZE:
                self.set_status(400)
                self.finish(
                    {"error": "File size too large. Maximum 5MB allowed"})
                return

            # Generate unique filename for public access
            file_extension = original_filename.rsplit(
                '.', 1)[1].lower() if '.' in original_filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(
                uuid.uuid4())

            # Create public filename (same as unique filename)
            public_filename = unique_filename

            # Store in user's private directory for ownership tracking
            user_logos_path = ["home", user, "logos"]
            dirobj = cloud.storage.storage.getFile(user_logos_path)
            if not dirobj:
                cloud.storage.storage.createDir(user_logos_path)

            # Also store in public logos directory
            public_logos_path = ["logos"]
            public_dirobj = cloud.storage.storage.getFile(public_logos_path)
            if not public_dirobj:
                cloud.storage.storage.createDir(public_logos_path)

            # Create file paths
            user_file_path = user_logos_path + [unique_filename]
            public_file_path = public_logos_path + [public_filename]

            # Check if file already exists (very unlikely with UUID)
            existing_file = cloud.storage.storage.getFile(user_file_path)
            if existing_file:
                self.set_status(409)
                self.finish({"error": "File already exists"})
                return

            # Create file metadata
            file_metadata = {
                "original_filename": original_filename,
                "unique_filename": unique_filename,
                "public_filename": public_filename,
                "owner": user,  # Track who owns this logo
                "file_size": len(file_content),
                "created_at": datetime.utcnow().isoformat(),
                "content_type": file_data.get('content_type', mimetypes.guess_type(original_filename)[0] or 'application/octet-stream')
            }

            # Encode file content for storage
            encoded_content = base64.b64encode(file_content).decode('utf-8')
            file_metadata["encoding"] = "base64"

            # Store file with metadata
            file_data_with_meta = {
                "metadata": file_metadata,
                "content": encoded_content
            }

            # Create file in both user directory (for ownership) and public directory
            user_success = cloud.storage.storage.createFile(
                user_file_path, json.dumps(file_data_with_meta))
            public_success = cloud.storage.storage.createFile(
                public_file_path, json.dumps(file_data_with_meta))

            if user_success and public_success:
                logo_id = hash(unique_filename)
                self.finish({
                    "success": True,
                    "logo_id": logo_id,
                    "filename": original_filename,
                    "logo_url": f"/logos/{public_filename}",  # Public URL
                    "file_size": len(file_content),
                    "message": "Logo uploaded successfully"
                })
            else:
                # Clean up if one failed
                if user_success:
                    cloud.storage.storage.deleteFile(user_file_path)
                if public_success:
                    cloud.storage.storage.deleteFile(public_file_path)
                self.set_status(500)
                self.finish({"error": "Failed to upload logo"})

        except Exception as e:
            logging.error(f"Error uploading logo: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})

    def delete(self):
        """Delete a specific logo for authenticated user"""
        try:
            user = self.get_current_user()
            if user is None:
                self.set_status(401)
                self.finish({"error": "Authentication required"})
                return

            # Get logo filename from query parameter or JSON body
            logo_filename = self.get_argument('filename', None)
            if not logo_filename:
                try:
                    request_data = json.loads(
                        self.request.body.decode('utf-8'))
                    logo_filename = request_data.get('filename')
                except:
                    pass

            if not logo_filename:
                self.set_status(400)
                self.finish({"error": "Logo filename parameter is required"})
                return

            # Validate filename
            if not logo_filename or logo_filename.strip() == '':
                self.set_status(400)
                self.finish({"error": "Invalid filename"})
                return

            # Create file paths
            user_logos_path = ["home", user, "logos"]
            user_file_path = user_logos_path + [logo_filename]

            # Check if file exists and belongs to user
            existing_file = cloud.storage.storage.getFile(user_file_path)
            if not existing_file:
                self.set_status(404)
                self.finish({"error": "Logo not found or access denied"})
                return

            # Get the public filename from metadata
            try:
                file_json = json.loads(existing_file.data)
                metadata = file_json.get("metadata", {})
                public_filename = metadata.get(
                    "public_filename", logo_filename)

                # Verify ownership
                if metadata.get("owner") != user:
                    self.set_status(403)
                    self.finish({"error": "Access denied"})
                    return

            except (json.JSONDecodeError, KeyError):
                # Fallback for legacy files
                public_filename = logo_filename

            # Delete from both user directory and public directory
            user_success = cloud.storage.storage.deleteFile(user_file_path)

            public_logos_path = ["logos"]
            public_file_path = public_logos_path + [public_filename]
            public_success = cloud.storage.storage.deleteFile(public_file_path)

            if user_success:
                self.finish({
                    "success": True,
                    "message": "Logo deleted successfully"
                })
            else:
                self.set_status(500)
                self.finish({"error": "Failed to delete logo"})

        except Exception as e:
            logging.error(f"Error deleting logo: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})


# Handler to serve logo files directly
class LogoServeHandler(BaseHandler):
    def get(self, filename):
        """Serve logo files directly from public directory - no authentication required"""
        try:
            # Create file path for public logos directory
            logos_path = ["logos", filename]
            file_data = cloud.storage.storage.getFile(logos_path)

            if not file_data or not hasattr(file_data, 'data'):
                self.set_status(404)
                self.finish({"error": "Logo not found"})
                return

            try:
                file_json = json.loads(file_data.data)
                if "metadata" in file_json and "content" in file_json:
                    metadata = file_json["metadata"]
                    content = file_json["content"]

                    # Handle different encodings
                    if metadata.get("encoding") == "base64":
                        # Decode base64 content
                        actual_content = base64.b64decode(content)
                        content_type = metadata.get(
                            "content_type", "application/octet-stream")
                    else:
                        # Text content (shouldn't happen for images, but handle it)
                        actual_content = content.encode(
                            'utf-8') if isinstance(content, str) else content
                        content_type = metadata.get(
                            "content_type", "application/octet-stream")

                    # Set appropriate headers for public access
                    self.set_header("Content-Type", content_type)
                    self.set_header("Content-Length", str(len(actual_content)))
                    # Cache for 24 hours for public logos
                    self.set_header("Cache-Control", "public, max-age=86400")
                    # Allow cross-origin access
                    self.set_header("Access-Control-Allow-Origin", "*")

                    self.write(actual_content)
                    self.finish()
                    return
                else:
                    # Legacy or invalid format
                    self.set_status(400)
                    self.finish({"error": "Invalid file format"})
                    return

            except json.JSONDecodeError:
                self.set_status(400)
                self.finish({"error": "Invalid file format"})
                return

        except Exception as e:
            logging.error(f"Error serving logo: {e}")
            self.set_status(500)
            self.finish({"error": "Internal server error"})


class DirectHtmlToPdfHandler(BaseHandler):
    def download_and_encode_image(self, img_url, timeout=10):
        """
        Download an image from URL and convert it to base64 data URI.
        Returns the base64 data URI string or None if failed.
        """
        try:
            logging.info(
                f"DirectHtmlToPdfHandler: Downloading image from {img_url}")

            # Validate URL
            parsed_url = urlparse(img_url)
            if not parsed_url.scheme or not parsed_url.netloc:
                logging.warning(
                    f"DirectHtmlToPdfHandler: Invalid image URL: {img_url}")
                return None

            # Download image with timeout
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(
                img_url, headers=headers, timeout=timeout, stream=True)
            response.raise_for_status()

            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                logging.warning(
                    f"DirectHtmlToPdfHandler: URL does not point to an image: {img_url} (content-type: {content_type})")
                return None

            # Read image data
            image_data = response.content
            if len(image_data) == 0:
                logging.warning(
                    f"DirectHtmlToPdfHandler: Empty image data from {img_url}")
                return None

            # Check file size (limit to 10MB)
            if len(image_data) > 10 * 1024 * 1024:
                logging.warning(
                    f"DirectHtmlToPdfHandler: Image too large ({len(image_data)} bytes): {img_url}")
                return None

            # Convert to base64
            base64_data = base64.b64encode(image_data).decode('utf-8')
            data_uri = f"data:{content_type};base64,{base64_data}"

            logging.info(
                f"DirectHtmlToPdfHandler: Successfully converted image to base64 ({len(image_data)} bytes)")
            return data_uri

        except requests.exceptions.Timeout:
            logging.warning(
                f"DirectHtmlToPdfHandler: Timeout downloading image: {img_url}")
            return None
        except requests.exceptions.RequestException as e:
            logging.warning(
                f"DirectHtmlToPdfHandler: Failed to download image {img_url}: {e}")
            return None
        except Exception as e:
            logging.error(
                f"DirectHtmlToPdfHandler: Unexpected error processing image {img_url}: {e}")
            return None

    def process_images_in_html(self, html_content, max_images=20):
        """
        Find all img tags in HTML, download external images, convert to base64,
        and replace src attributes to prevent PDF generation issues.
        Limited to max_images to prevent abuse.
        """
        logging.info(
            "DirectHtmlToPdfHandler: Processing images in HTML content")

        try:
            # Pattern to find img tags with src attributes
            img_pattern = r'<img[^>]*src\s*=\s*["\']([^"\']+)["\'][^>]*>'

            # Count total images first
            total_images = len(re.findall(
                img_pattern, html_content, flags=re.IGNORECASE))
            if total_images > max_images:
                logging.warning(
                    f"DirectHtmlToPdfHandler: Too many images ({total_images}), limiting to {max_images}")

            processed_count = 0

            def replace_img_src(match):
                nonlocal processed_count

                # Limit number of images processed
                if processed_count >= max_images:
                    img_tag = match.group(0)
                    img_url = match.group(1)
                    logging.warning(
                        f"DirectHtmlToPdfHandler: Skipping image due to limit: {img_url}")
                    return f'<!-- Image skipped: {img_url} (max limit reached) -->'

                img_tag = match.group(0)
                img_url = match.group(1)

                logging.info(f"DirectHtmlToPdfHandler: Found image: {img_url}")

                # Skip if already a data URI
                if img_url.startswith('data:'):
                    logging.info(
                        "DirectHtmlToPdfHandler: Image is already a data URI, skipping")
                    return img_tag

                # Skip relative URLs or local file paths for now
                parsed_url = urlparse(img_url)
                if not parsed_url.scheme or parsed_url.scheme not in ['http', 'https']:
                    logging.info(
                        f"DirectHtmlToPdfHandler: Skipping non-HTTP URL: {img_url}")
                    return img_tag

                processed_count += 1

                # Download and convert image
                data_uri = self.download_and_encode_image(img_url)

                if data_uri:
                    # Replace the src attribute with the data URI
                    new_img_tag = re.sub(
                        r'src\s*=\s*["\'][^"\']+["\']',
                        f'src="{data_uri}"',
                        img_tag
                    )
                    logging.info(
                        "DirectHtmlToPdfHandler: Successfully replaced image src with base64 data")
                    return new_img_tag
                else:
                    # If download failed, remove the image to prevent hanging
                    logging.warning(
                        f"DirectHtmlToPdfHandler: Removing failed image: {img_url}")
                    return f'<!-- Image removed: {img_url} (download failed) -->'

            # Replace all img tags
            processed_html = re.sub(
                img_pattern, replace_img_src, html_content, flags=re.IGNORECASE)

            # Count how many images were processed
            final_img_count = len(re.findall(
                r'<img[^>]*src\s*=\s*["\']data:', processed_html, flags=re.IGNORECASE))

            logging.info(
                f"DirectHtmlToPdfHandler: Processed {total_images} images, {final_img_count} converted to base64, {processed_count} attempted")

            return processed_html

        except Exception as e:
            logging.error(
                f"DirectHtmlToPdfHandler: Error processing images in HTML: {e}")
            # Return original HTML if processing fails
            return html_content

    def post(self):
        """
        Convert HTML content to PDF and return the PDF file directly.
        Accepts HTML content in the request body and returns PDF.
        """
        try:
            current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            header_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                     body {{
                        margin: 0;
                        padding: 5px 10px;
                        font-family: Arial, sans-serif;
                        font-size: 10px;
                    }}
                    .footer-container {{
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }}
                    .footer-left {{
                        text-align: left;
                    }}
                    .footer-right {{
                        text-align: right;
                    }}
                </style>
            </head>
            <body>
                <div style="text-align: left;">{current_datetime}</div>
            """

            footer_html = """
            </body>
            </html>
            """

            # Parse request data
            html_content = None
            filename = 'document.pdf'
            custom_options = {}

            # Check if request contains JSON data
            if hasattr(self.request, 'body') and self.request.body:
                try:
                    # Try to parse as JSON first
                    content_type = self.request.headers.get(
                        'Content-Type', '').lower()
                    if 'application/json' in content_type:
                        data = json.loads(self.request.body.decode('utf-8'))
                        if not data or 'html_content' not in data:
                            self.set_status(400)
                            self.finish(
                                {"error": "html_content is required in JSON body"})
                            return
                        html_content = header_html + \
                            data['html_content'] + footer_html
                        filename = data.get('filename', 'document.pdf')
                        # Support both 'options' and 'pdfOptions' for backward compatibility
                        custom_options = data.get(
                            'options', data.get('pdfOptions', {}))
                    else:
                        # Try to parse as form data
                        html_content = self.get_argument('html_content', None)
                        if html_content:
                            html_content = header_html + html_content + footer_html
                            filename = self.get_argument(
                                'filename', 'document.pdf')
                        else:
                            self.set_status(400)
                            self.finish({"error": "html_content is required"})
                            return
                except (json.JSONDecodeError, UnicodeDecodeError) as e:
                    logging.error(f"JSON parsing error: {e}")
                    self.set_status(400)
                    self.finish({"error": "Invalid JSON or encoding"})
                    return
            else:
                # Check if HTML file was uploaded
                if hasattr(self.request, 'files') and 'file' in self.request.files:
                    file_info = self.request.files['file'][0]
                    if not file_info['filename']:
                        self.set_status(400)
                        self.finish({"error": "No file selected"})
                        return

                    if not file_info['filename'].lower().endswith(('.html', '.htm')):
                        self.set_status(400)
                        self.finish({"error": "Only HTML files are allowed"})
                        return

                    html_content = file_info['body'].decode('utf-8')
                    filename = file_info['filename'].rsplit('.', 1)[0] + '.pdf'
                    custom_options = {}
                else:
                    self.set_status(400)
                    self.finish({
                        "error": "Provide HTML content in JSON body with 'html_content' field or upload an HTML file"
                    })
                    return

            # Clean and validate HTML if BeautifulSoup is available
            if BeautifulSoup:
                try:
                    soup = BeautifulSoup(html_content, 'html.parser')
                    cleaned_html = str(soup)
                except Exception as e:
                    logging.warning(
                        f"BeautifulSoup parsing failed: {e}, using raw HTML")
                    cleaned_html = html_content
            else:
                cleaned_html = html_content

            # Process images in HTML to prevent hanging during PDF generation
            logging.info(
                "DirectHtmlToPdfHandler: Processing external images in HTML")
            try:
                processed_html = self.process_images_in_html(cleaned_html)
                logging.info(
                    "DirectHtmlToPdfHandler: Image processing completed successfully")
            except Exception as e:
                logging.error(
                    f"DirectHtmlToPdfHandler: Image processing failed: {e}")
                processed_html = cleaned_html

            # Merge custom options with default PDF options
            pdf_options = {**PDF_OPTIONS, **custom_options}

            # Generate PDF
            try:
                config = get_wkhtmltopdf_config()
                if config is None:
                    self.set_status(500)
                    self.finish({
                        "error": "wkhtmltopdf not found. Please ensure wkhtmltopdf is installed and accessible."
                    })
                    return

                pdf_data = None

                if PDFKIT_AVAILABLE:
                    try:
                        # Use pdfkit if available
                        pdf_data = pdfkit.from_string(
                            processed_html, False, options=pdf_options, configuration=config)
                    except Exception as e:
                        logging.warning(
                            f"pdfkit failed: {e}, falling back to direct wkhtmltopdf")
                        pdf_data = None

                if pdf_data is None:
                    # Fallback to direct wkhtmltopdf command
                    try:
                        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as tmp_html:
                            tmp_html.write(processed_html)
                            tmp_html_path = tmp_html.name

                        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_pdf:
                            tmp_pdf_path = tmp_pdf.name

                        # Build command with options
                        cmd = [config]

                        # Add PDF options to command
                        for key, value in pdf_options.items():
                            if value is not None:
                                if value is True or value == "":
                                    cmd.append(f"--{key}")
                                else:
                                    cmd.extend([f"--{key}", str(value)])

                        cmd.extend([tmp_html_path, tmp_pdf_path])

                        logging.info(
                            f"Running wkhtmltopdf command: {' '.join(cmd)}")
                        # Increased timeout since we might have processed many images
                        result = subprocess.run(
                            cmd, capture_output=True, text=True, timeout=60)

                        if result.returncode != 0:
                            logging.error(
                                f"wkhtmltopdf stderr: {result.stderr}")
                            raise Exception(
                                f"wkhtmltopdf failed with return code {result.returncode}: {result.stderr}")

                        if not os.path.exists(tmp_pdf_path):
                            raise Exception("PDF file was not generated")

                        with open(tmp_pdf_path, 'rb') as f:
                            pdf_data = f.read()

                        if not pdf_data:
                            raise Exception("Generated PDF is empty")

                    except subprocess.TimeoutExpired:
                        raise Exception("PDF generation timed out")
                    except Exception as e:
                        logging.error(f"Direct wkhtmltopdf failed: {e}")
                        raise e
                    finally:
                        # Clean up temporary files
                        try:
                            if 'tmp_html_path' in locals():
                                os.unlink(tmp_html_path)
                            if 'tmp_pdf_path' in locals():
                                os.unlink(tmp_pdf_path)
                        except Exception as cleanup_error:
                            logging.warning(
                                f"Failed to cleanup temp files: {cleanup_error}")

            except Exception as e:
                logging.error(f"PDF generation error: {e}")
                self.set_status(500)
                self.finish({"error": f"PDF generation failed: {str(e)}"})
                return

            # Return PDF file directly
            self.set_header('Content-Type', 'application/pdf')
            self.set_header('Content-Disposition',
                            f'attachment; filename="{filename}"')
            self.set_header('Cache-Control', 'no-cache')
            self.write(pdf_data)
            self.finish()

        except Exception as e:
            logging.error(f"DirectHtmlToPdfHandler error: {e}")
            self.set_status(500)
            self.finish({"error": f"Conversion failed: {str(e)}"})


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    print("Starting server on port %d" % options.port)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
