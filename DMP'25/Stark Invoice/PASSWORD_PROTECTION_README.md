# Password Protection Feature

## Overview

Password protection allows users to encrypt invoice files with AES encryption for enhanced security.

## Features

- **Save with Password**: Use "Save As (Password Protected)" in menu
- **Visual Indicators**: Lock icon and "ENCRYPTED" badge for protected files
- **Secure Access**: Password prompt when opening encrypted files

## Usage

1. **Save Protected**: Menu → "Save As (Password Protected)" → Enter filename & password
2. **Open Protected**: Files page → Click encrypted file → Enter password

## Technical Details

- Uses CryptoJS for AES encryption
- Files stored locally with encryption flag
- No password recovery (users must remember passwords)

## Security Notes

- Passwords never stored in plain text
- Encryption/decryption in memory only
- Consider additional measures for highly sensitive data
