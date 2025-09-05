# MediToken Setup Guide

This guide will walk you through setting up, building, testing, and deploying the MediToken contract.

## 🚀 Quick Start

### Prerequisites

- [Scarb](https://docs.swmansion.com/scarb/) - Cairo package manager
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) - Testing framework
- [Starkli](https://github.com/xJonathanLEI/starkli) - StarkNet CLI (for deployment)

### Installation

```bash
# Clone the repository (if you have a remote)
git clone <your-repo-url>
cd ppttoken

# Or if working locally
cd /path/to/your/ppttoken

# Install dependencies and build
scarb build
```

### Testing

📋 **For comprehensive testing guide and test coverage details, see [TESTING.md](TESTING.md)**

```bash
# Quick test commands
snforge test              # Run all tests
snforge test -v           # Run with verbose output
snforge test test_airdrop # Run airdrop-specific tests
```

## 📦 Deployment Guide

### Local/Testnet Deployment

#### 1. Prerequisites Setup

```bash
# Make sure you're in the project directory
cd /path/to/ppttoken

# Ensure contract is built
scarb build

# Check if starkli is installed
starkli --version
```

#### 2. Account Setup (if not done already)

```bash
# Create account descriptor (if you don't have one)
starkli account oz init ~/.starkli-wallets/deployer

# Create keystore (if you don't have one)
starkli signer keystore new ~/.starkli-wallets/deployer/keystore.json
```

#### 3. Set Environment Variables

```bash
# Set your account and keystore paths
export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json
export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json

# Set network (for testnet)
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
```

#### 4. Contract Deployment Steps

```bash
# 1. Build the contract
scarb build

# 2. Declare the contract (replace with your account details)
starkli declare target/dev/ppttoken_MedToken.contract_class.json

# 3. Deploy the contract
# Parameters: initial_tokens (felt252), recipient (ContractAddress)
starkli deploy <class-hash> \
    1000 \
    0x1234567890123456789012345678901234567890123456789012345678901234
```

#### 5. Complete Deployment Example

```bash
# Navigate to project
cd /path/to/ppttoken

# Build the contract
scarb build

# Declare the contract
starkli declare target/dev/ppttoken_MedToken.contract_class.json

# Example output: Class hash declared: 0x1234567890abcdef...

# Deploy the contract (replace with your actual class hash and recipient)
starkli deploy 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
    1000 \
    0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7

# Example output: Contract deployed: 0xabcdef1234567890...
```

### Mainnet Deployment

**⚠️ Warning**: Thoroughly test on testnets before mainnet deployment!

```bash
# Set mainnet RPC
export STARKNET_RPC=https://starknet-mainnet.public.blastapi.io/rpc/v0_7

# Use same process as testnet
starkli declare target/dev/ppttoken_MedToken.contract_class.json
starkli deploy <class-hash> <initial_tokens> <recipient_address>
```

## 🔧 Development Workflow

### Building

```bash
scarb build
```

### Code Formatting

```bash
scarb fmt
```

### Running Tests

📋 **For detailed testing instructions and test coverage, see [TESTING.md](TESTING.md)**

```bash
# Quick test commands
snforge test              # Run all tests
snforge test -v           # Run with verbose output
snforge test <test_name>  # Run specific test
```

## 🌐 Network Configuration

### Sepolia Testnet (Recommended for testing)

```bash
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
```

### Mainnet (Production)

```bash
export STARKNET_RPC=https://starknet-mainnet.public.blastapi.io/rpc/v0_7
```

## 🔍 Contract Verification

After deployment, you can verify your contract:

```bash
# Check contract class
starkli class-at <CONTRACT_ADDRESS>

# Check contract storage (example: get total supply)
starkli call <CONTRACT_ADDRESS> total_supply

# Check contract name
starkli call <CONTRACT_ADDRESS> name

# Check airdrop count
starkli call <CONTRACT_ADDRESS> get_airdrop_count

# Check remaining airdrops
starkli call <CONTRACT_ADDRESS> get_remaining_airdrops
```

## 📋 Constructor Parameters

Your MediToken constructor takes 2 parameters:

1. **`initial_tokens: felt252`** - Number of tokens to mint initially

   - Example: `1000` creates 1000 MED tokens (1000 × 10^18 wei)

2. **`recipient: ContractAddress`** - Address that receives the initial tokens
   - Must be a valid StarkNet address (starts with 0x)

## 📁 Important Files

- **Contract Class**: `target/dev/ppttoken_MedToken.contract_class.json` - Use this for deployment
- **Source Code**: `src/contracts/ppttoken.cairo` - Main contract implementation
- **Tests**: `tests/test_contract.cairo` - Comprehensive test suite
- **Config**: `Scarb.toml` - Project configuration

## ⚠️ Important Notes

1. **File to use**: Always use `target/dev/ppttoken_MedToken.contract_class.json` for deployment
2. **Gas fees**: Ensure your account has enough ETH to pay for declaration and deployment
3. **Testnet first**: Always test on Sepolia testnet before mainnet deployment
4. **Save addresses**: Keep track of your declared class hash and deployed contract address
5. **Environment**: Make sure your environment variables are set correctly

## 🔗 Reference Links

### Documentation

- [Cairo Documentation](https://book.cairo-lang.org/)
- [StarkNet Documentation](https://docs.starknet.io/)
- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)

### Tools

- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)
- [Scarb Package Manager](https://docs.swmansion.com/scarb/)
- [Starkli CLI](https://github.com/xJonathanLEI/starkli)

### Networks & Explorers

- [StarkScan - Sepolia Testnet](https://sepolia.starkscan.co/)
- [StarkScan - Mainnet](https://starkscan.co/)
- [Voyager Explorer](https://voyager.online/)

### RPC Endpoints

- **Sepolia Testnet**: `https://starknet-sepolia.public.blastapi.io/rpc/v0_7`
- **Mainnet**: `https://starknet-mainnet.public.blastapi.io/rpc/v0_7`

---

**Need help?** Check the main [README.md](README.md) for contract details and usage examples.
