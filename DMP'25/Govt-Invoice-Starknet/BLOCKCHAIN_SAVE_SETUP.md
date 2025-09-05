# Blockchain Save Functionality Setup Guide

## Overview

This guide explains how to set up and use the "Save to Blockchain" functionality that has been added to your Government Invoice Form application. This feature allows users to save their invoice files to the blockchain using IPFS (InterPlanetary File System) for decentralized storage.

## Features Added

### 1. Save to Blockchain
- **Location**: File Options menu (three dots icon in the top toolbar)
- **Function**: Uploads file content to IPFS and stores the reference on the blockchain
- **Requirements**: Connected wallet and sufficient storage allocation

### 2. Storage Limit Alerts
- **Warning Alert**: Shows when users reach 90% of their storage limit
- **Limit Reached Alert**: Comprehensive dialog when storage limit is exceeded
- **Helpful Information**: Displays current usage and available storage

### 3. Wallet Integration
- **Connection Check**: Ensures wallet is connected before allowing blockchain saves
- **Transaction Handling**: Manages the blockchain transaction for saving file references
- **Error Handling**: Provides clear feedback for failed transactions

## Setup Instructions

### 1. Pinata IPFS Configuration

Create a Pinata account and configure your API credentials:

1. Go to [Pinata Cloud](https://pinata.cloud)
2. Create a free account
3. Navigate to "API Keys" in your dashboard
4. Create a new API key with these permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `userPinnedDataTotal`

### 2. Environment Variables

Add your Pinata credentials to your `.env` file:

```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 3. Wallet Connection

Ensure your wallet is properly connected:
- Click the wallet connect button in the top toolbar
- Follow the connection process for your StarkNet wallet
- Verify connection status (green wifi icon indicates online/connected)

## How to Use

### Saving to Blockchain

1. **Open the File Options menu**:
   - Click the three dots (ellipsis) icon in the top toolbar
   - The menu will open showing various file operations

2. **Select "Save to Blockchain"**:
   - Click on the "Save to Blockchain" option
   - The system will check your wallet connection and storage limits

3. **Process Flow**:
   - If wallet is not connected, you'll be prompted to connect first
   - If storage limit is reached, you'll see an alert with purchase options
   - Otherwise, the file will be uploaded to IPFS and saved to blockchain
   - Progress messages will show: "Uploading to IPFS..." then "Saving to blockchain..."
   - Success message will confirm the save operation

### Storage Limit Management

#### Warning System
- **90% Usage**: Toast notification warns you're approaching the limit
- **100% Usage**: Alert dialog prevents saving and offers purchase options

#### Limit Information
- Current usage displayed as "X out of Y files"
- Percentage calculation for usage tracking
- Clear messaging about storage constraints

## Technical Details

### File Storage Process

1. **Content Preparation**: Current spreadsheet content is extracted along with file metadata
2. **Metadata Structure**: Complete file information is packaged including:
   - `created`: Original file creation timestamp
   - `modified`: Last modification timestamp  
   - `name`: File name
   - `billType`: Invoice/document type identifier
   - `templateId`: Template used for the document
   - `isEncrypted`: Encryption status (future feature)
   - `content`: Complete spreadsheet data (MSC - Main Spreadsheet Content)
   - `blockchain`: Additional blockchain metadata (upload info, version, etc.)
3. **IPFS Upload**: Complete metadata object is uploaded to IPFS via Pinata
4. **CID Generation**: IPFS returns a Content Identifier (CID) for the metadata package
5. **Blockchain Storage**: CID is stored on the blockchain with filename
6. **Confirmation**: Transaction hash confirms successful storage

### Enhanced Metadata Structure

Files saved to blockchain now include comprehensive metadata:

```json
{
  "created": "2025-01-24T10:30:00.000Z",
  "modified": "2025-01-24T15:45:00.000Z", 
  "name": "Invoice_2025_001",
  "billType": 1,
  "templateId": 3,
  "isEncrypted": false,
  "content": {
    // Complete spreadsheet data (MSC)
    "cells": { ... },
    "sheet": { ... }
  },
  "blockchain": {
    "uploadedAt": "2025-01-24T15:45:00.000Z",
    "uploadedBy": "0x1234...abcd",
    "version": "1.0",
    "fileSize": 15420,
    "contentType": "application/json"
  }
}
```

### Backward Compatibility

The system supports both:
- **New Format**: Files with complete metadata structure
- **Legacy Format**: Previously saved files with raw content only

When loading files, the system automatically detects the format and handles accordingly.

### Loading Files from Blockchain

The enhanced system automatically handles different file formats:

#### New Metadata Format (Current)
```json
{
  "created": "2025-01-24T10:30:00.000Z",
  "modified": "2025-01-24T15:45:00.000Z",
  "name": "Invoice_2025_001", 
  "billType": 1,
  "templateId": 3,
  "content": { 
    "cells": { "A1": {"v": "Invoice"} },
    "sheet": { /* spreadsheet structure */ }
  },
  "blockchain": {
    "uploadedAt": "2025-01-24T15:45:00.000Z",
    "uploadedBy": "0x1234...abcd",
    "version": "1.0"
  }
}
```

#### Legacy Format Support
```json
{
  "cells": { "A1": {"v": "Invoice"} },
  "sheet": { /* raw spreadsheet content */ }
}
```

**Loading Process:**
1. Downloads content from IPFS using the stored CID
2. Detects if it's new metadata format or legacy format
3. Extracts spreadsheet content and metadata accordingly
4. Restores bill type and template information when available
5. Loads content into the spreadsheet editor with proper context

### Error Handling

Common error scenarios and solutions:

- **"Please connect your wallet first"**: Connect your StarkNet wallet
- **"Pinata API credentials not configured"**: Check your `.env` file
- **"File limit reached"**: Purchase additional storage or delete unused files
- **"Failed to upload to IPFS"**: Check internet connection and Pinata status
- **"Failed to save to blockchain"**: Check wallet connection and network status

### Storage Costs

- **IPFS Storage**: Managed by Pinata (free tier available)
- **Blockchain Storage**: Only stores file references (CIDs), minimal gas costs
- **File Limits**: Managed by smart contract subscription system

## Benefits

### Decentralization
- Files stored on IPFS, not centralized servers
- Blockchain provides permanent, tamper-proof file references
- No single point of failure

### Cost Efficiency
- Only file hashes stored on-chain, reducing gas costs
- IPFS provides cost-effective decentralized storage with rich metadata
- Subscription model for predictable costs

### Transparency
- All file operations recorded on blockchain
- Public verification of file integrity and metadata
- Complete audit trail for government invoice processes
- Preserved file history including creation dates and modifications

## Troubleshooting

### Connection Issues
1. Verify wallet extension is installed and enabled
2. Check network connectivity
3. Ensure you're on the correct StarkNet network

### Upload Failures
1. Check Pinata API credentials in `.env`
2. Verify Pinata account has sufficient quota
3. Test with smaller files first

### Transaction Failures
1. Ensure sufficient wallet balance for gas fees
2. Check wallet connection status
3. Try the operation again after a few moments

## Support

For additional help:
- Check the browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure Pinata account is active and has quota available
- Contact support if blockchain network issues persist

## Next Steps

Consider implementing these additional features:
- File versioning on blockchain
- Encrypted file storage for sensitive data
- Batch operations for multiple files
- Advanced metadata storage and retrieval
