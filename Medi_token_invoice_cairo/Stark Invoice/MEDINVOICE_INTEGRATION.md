# MedInvoice Blockchain Integration

This document describes the MedInvoice smart contract integration with the Stark Invoice application.

## Features

### 1. Wallet Connection

- Connect to Argent or Braavos wallets
- Display wallet address and connection status
- Support for Starknet Sepolia and Mainnet

### 2. File Management

- Upload files to IPFS via Pinata
- Store file metadata and IPFS hashes on the blockchain
- Retrieve and download files from IPFS
- View file history and metadata

### 3. Subscription Management

- Check subscription status
- Purchase subscriptions with STRK tokens
- View remaining subscription time
- Token balance management

### 4. IPFS Integration

- File upload to Pinata IPFS service
- Metadata storage including file type, size, and timestamps
- Secure file retrieval with hash verification

## Smart Contract Functions

### Read Functions

- `get_files(user_address)` - Get all files for a user
- `get_user_tokens(user_address)` - Get user's token balance
- `is_subscribed(user_address)` - Check subscription status
- `get_subscription_expiry(user_address)` - Get subscription end time
- `get_file_count(user_address)` - Get total file count for user

### Write Functions

- `save_file(ipfs_hash, metadata)` - Save file to blockchain
- `subscribe(months)` - Purchase subscription
- `withdraw_tokens(amount)` - Withdraw tokens (admin only)

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `VITE_MEDINVOICE_CONTRACT_ADDRESS` - Deployed contract address
- `VITE_PINATA_API_KEY` - Pinata API key
- `VITE_PINATA_SECRET_API_KEY` - Pinata secret key
- `VITE_PINATA_JWT` - Pinata JWT token

### 2. Pinata Setup

1. Create account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys in the API Keys section
3. Add keys to your `.env` file

### 3. Contract Deployment

Deploy the MedInvoice contract to Starknet and update the contract address in `.env`.

## Component Architecture

### Providers

- `StarknetProviders.tsx` - Starknet React providers with wallet connectors

### Hooks

- `useContractRead.ts` - React hooks for reading contract state
- `useContractWrite.ts` - React hooks for contract transactions

### Components

- `WalletConnection.tsx` - Wallet connection interface
- `FileUpload.tsx` - File upload with IPFS integration
- `FilesList.tsx` - Display and manage uploaded files
- `Subscription.tsx` - Subscription management interface

### Utilities

- `ipfs.ts` - IPFS/Pinata integration utilities
- `medInvoiceAbi.ts` - Smart contract ABI

## Usage

### Connecting Wallet

1. Click "Connect Wallet" button
2. Select Argent or Braavos wallet
3. Approve connection in wallet

### Uploading Files

1. Ensure wallet is connected and subscription is active
2. Select file and fill in metadata
3. Click "Upload to Blockchain"
4. Confirm transaction in wallet

### Managing Subscription

1. Check current subscription status
2. Purchase subscription with STRK tokens
3. Monitor remaining time

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Testing

The integration includes comprehensive error handling and loading states for all blockchain operations.

## Security Considerations

- Environment variables are gitignored
- File uploads are validated for type and size
- Smart contract interactions include proper error handling
- IPFS hashes are verified before storage

## Troubleshooting

### Common Issues

1. **Wallet not connecting**: Ensure wallet extension is installed and unlocked
2. **Transaction failing**: Check STRK balance and network connection
3. **IPFS upload failing**: Verify Pinata API credentials
4. **Contract not found**: Confirm contract address and network settings

### Error Messages

The application provides detailed error messages for:

- Network connectivity issues
- Insufficient token balance
- Subscription expiration
- File upload failures
- Contract interaction errors
