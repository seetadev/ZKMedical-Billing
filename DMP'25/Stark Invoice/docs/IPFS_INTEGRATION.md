# IPFS Integration Guide

This application now supports storing invoice files on IPFS (InterPlanetary File System) through the blockchain functionality.

## Features

### File Storage

- **Save to Blockchain**: When you save a file to the blockchain, it's first uploaded to IPFS
- **Decentralized Storage**: Files are stored on IPFS, ensuring permanence and decentralization
- **Blockchain Reference**: Only the IPFS hash (CID) is stored on the blockchain, reducing on-chain storage costs

### File Retrieval

- **Load from Blockchain**: Click on any blockchain file to load it directly from IPFS
- **Download**: Swipe left on blockchain files to reveal download option
- **Automatic Loading**: Files are automatically parsed and loaded into the editor

## Setup

### 1. Pinata Configuration

This app uses Pinata as the IPFS gateway for reliability. You need to set up a Pinata account:

1. Go to [Pinata Cloud](https://pinata.cloud)
2. Create a free account
3. Navigate to "API Keys" in your dashboard
4. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `userPinnedDataTotal`

### 2. Environment Variables

Add your Pinata credentials to your `.env` file:

```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_KEY=your_secret_key_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 3. Testing

Run the test script to verify your IPFS setup:

```bash
node test-ipfs.js
```

## How It Works

### Saving Files to Blockchain

1. User clicks "Save to Blockchain"
2. File content is uploaded to IPFS via Pinata
3. IPFS returns a Content Identifier (CID)
4. The CID is stored on the blockchain with the filename
5. File is now permanently available on IPFS

### Loading Files from Blockchain

1. User clicks on a blockchain file in the Files page
2. App retrieves the IPFS CID from the blockchain
3. File content is downloaded from IPFS using the CID
4. Content is parsed and loaded into the spreadsheet editor

### File Format

Files are stored on IPFS as JSON objects containing:

- Spreadsheet cell data
- Metadata (creation date, filename, etc.)
- Version information

## Troubleshooting

### Common Issues

**"Pinata API credentials not configured"**

- Check that your `.env` file has the correct variable names
- Restart your development server after adding environment variables
- Verify your API key has the correct permissions

**"Failed to upload file to IPFS"**

- Check your internet connection
- Verify your Pinata account has sufficient quota
- Check the browser console for detailed error messages

**"Failed to retrieve file from IPFS"**

- The IPFS network might be temporarily unavailable
- Try a different IPFS gateway
- Check if the CID is valid

### Development Tips

1. **Local Testing**: Use the test script to verify IPFS functionality before testing in the app
2. **Error Handling**: Check browser console for detailed error messages
3. **File Size**: Large files may take longer to upload/download from IPFS
4. **Caching**: IPFS files are cached, so updates may take time to propagate

## Security Considerations

- IPFS files are publicly accessible by anyone with the CID
- Don't store sensitive information in IPFS files
- The blockchain only stores the CID, not the actual file content
- Consider encrypting sensitive data before uploading to IPFS

## Benefits

- **Decentralization**: Files aren't stored on a single server
- **Permanence**: Files remain accessible as long as they're pinned
- **Cost Effective**: Only CIDs are stored on-chain, reducing gas costs
- **Transparency**: All file hashes are publicly verifiable on the blockchain
