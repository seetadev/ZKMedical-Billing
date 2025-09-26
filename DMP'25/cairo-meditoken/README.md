# MediToken (MED) - Cairo Smart Contract

A comprehensive ERC20 token implementation built on StarkNet with an integrated airdrop mechanism for fair token distribution in the healthcare ecosystem.

Deployed Contract :- [0x008c6e8700604e0987069cfb5debf6fd359dc09f00f1c61ddac1e52b6e5ceff4](https://sepolia.starkscan.co/token/0x008c6e8700604e0987069cfb5debf6fd359dc09f00f1c61ddac1e52b6e5ceff4#read-write-contract-sub-read)

## 🌟 Features

### Core ERC20 Functionality

- **Standard ERC20 Implementation**: Full compliance with ERC20 standard using OpenZeppelin Cairo contracts
- **Token Details**:
  - Name: `PPT Token`
  - Symbol: `MED`
  - Decimals: `18`
  - Precision: `10^18` (1 MED = 1,000,000,000,000,000,000 wei)

### Airdrop System

- **Limited Distribution**: First 20 addresses can claim free tokens
- **Fair Allocation**: Each eligible address receives exactly 25 MED tokens
- **Anti-Gaming Protection**: One claim per address, no double claiming
- **Transparent Tracking**: Public functions to check claim status and remaining slots

## 🚀 Quick Start

📋 **For detailed setup, deployment, and development instructions, see [Setup.md](Setup.md)**

### Quick Commands

```bash
# Build the contract
scarb build

# Run all tests
snforge test

# Deploy to testnet (after setup)
starkli deploy <class-hash> <initial_tokens> <recipient_address>
```

## 📋 Contract Interface

### Constructor

```cairo
fn constructor(
    initial_tokens: felt252,    // Number of tokens to mint initially
    recipient: ContractAddress  // Address to receive initial tokens
)
```

### ERC20 Functions

Standard ERC20 functions are available:

- `transfer(to: ContractAddress, amount: u256) -> bool`
- `transfer_from(from: ContractAddress, to: ContractAddress, amount: u256) -> bool`
- `approve(spender: ContractAddress, amount: u256) -> bool`
- `balance_of(account: ContractAddress) -> u256`
- `allowance(owner: ContractAddress, spender: ContractAddress) -> u256`
- `total_supply() -> u256`
- `name() -> ByteArray`
- `symbol() -> ByteArray`
- `decimals() -> u8`

### Airdrop Functions

#### `claim_airdrop()`

Allows eligible addresses to claim their free 25 MED tokens.

**Requirements:**

- Address must not have claimed before
- Airdrop limit (20 recipients) must not be reached

**Events:** Emits `AirdropClaimed` event

#### `has_claimed_airdrop(address: ContractAddress) -> bool`

Checks if a specific address has already claimed their airdrop.

#### `get_airdrop_count() -> u32`

Returns the total number of addresses that have claimed airdrops.

#### `get_remaining_airdrops() -> u32`

Returns the number of airdrop slots remaining (20 - claimed count).

## 🔒 Security Features

### Airdrop Protection

- **Single Claim Enforcement**: Each address can only claim once
- **Supply Control**: Limited to exactly 20 recipients × 25 tokens = 500 MED total airdrop
- **State Tracking**: Persistent storage tracks all claims

### ERC20 Security

- **OpenZeppelin Base**: Built on battle-tested OpenZeppelin Cairo contracts
- **Overflow Protection**: Built-in SafeMath equivalent protections
- **Standard Compliance**: Full ERC20 standard implementation

## 📊 Token Economics

### Initial Distribution

- **Genesis Supply**: Configurable at deployment (set by `initial_tokens` parameter)
- **Airdrop Pool**: 500 MED tokens (20 recipients × 25 MED each)
- **Total Max Supply**: Genesis Supply + 500 MED

### Airdrop Mechanics

- **Eligibility**: First-come, first-served basis
- **Amount**: Fixed 25 MED tokens per eligible address
- **Limit**: Maximum 20 recipients
- **Claiming**: Anyone can call `claim_airdrop()` until limit reached

## 🧪 Testing Coverage

📋 **For complete testing guide, test coverage details, and how to write new tests, see [TESTING.md](TESTING.md)**

The contract includes **15 comprehensive tests** covering:

### Quick Test Overview

- ✅ **ERC20 Functionality** (9 tests): Constructor, transfers, approvals, edge cases
- ✅ **Airdrop System** (6 tests): Claims, security, state tracking, integration
- ✅ **Security Features**: Balance checks, double-claim prevention, limit enforcement
- ✅ **Edge Cases**: Zero transfers, self transfers, insufficient balance scenarios

**Current Status**: `Tests: 15 passed, 0 failed, 0 skipped`

## 📈 Usage Examples

### Deploying the Contract

```cairo
// Deploy with 1000 initial tokens to a specific recipient
let initial_tokens: felt252 = 1000;
let recipient: ContractAddress = 0x123...;

// This creates 1000 MED tokens (1000 × 10^18 wei)
```

### Claiming Airdrop

```cairo
// Any address can attempt to claim
contract.claim_airdrop();

// Check if successful
let has_claimed = contract.has_claimed_airdrop(my_address);
let remaining_slots = contract.get_remaining_airdrops();
```

### Using as Standard ERC20

```cairo
// Transfer tokens
contract.transfer(recipient, 100 * 10^18);  // Transfer 100 MED

// Approve spending
contract.approve(spender, 50 * 10^18);  // Approve 50 MED

// Check balance
let balance = contract.balance_of(user_address);
```

## 🏗️ Project Structure

```
ppttoken/
├── src/
│   ├── lib.cairo              # Library entry point
│   └── contracts/
│       └── ppttoken.cairo    # Main contract implementation
├── tests/
│   └── test_contract.cairo    # Comprehensive test suite
├── Scarb.toml                 # Project configuration
├── snfoundry.toml            # Foundry configuration
├── README.md                 # This file - project overview
├── Setup.md                  # Detailed setup and deployment guide
└── TESTING.md                # Complete testing guide and coverage
```

## 🔧 Development

📋 **For complete development setup and workflow, see [Setup.md](Setup.md)**

### Quick Commands

```bash
# Build the contract
scarb build

# Run all tests
snforge test

# Format code
scarb fmt
```

## 📝 Events

### AirdropClaimed

```cairo
struct AirdropClaimed {
    recipient: ContractAddress,  // Address that claimed
    amount: u256,               // Amount claimed (always 25 MED)
}
```

Emitted when someone successfully claims their airdrop tokens.

## ⚡ Gas Optimization

The contract is optimized for gas efficiency:

- **Storage Layout**: Efficient storage structure using Cairo's native `Map` and simple types
- **Batch Operations**: Single storage writes where possible
- **Component Reuse**: Leverages OpenZeppelin's optimized ERC20 implementation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This contract is for educational and development purposes. Ensure thorough testing and auditing before any mainnet deployment.

## 🔗 Links

📋 **Setup & Deployment**: [Setup.md](Setup.md) - Complete setup and deployment guide  
🧪 **Testing Guide**: [TESTING.md](TESTING.md) - Comprehensive testing documentation

### Project Resources

- **Deployed Contract**: [Sepolia Testnet](https://sepolia.starkscan.co/token/0x07e0b09cc6209d4211f150944e7fc0dab7338f0a3a6199ff96d4667bef0e68bc)
- **Source Code**: Available in `src/contracts/ppttoken.cairo`
- **Test Suite**: Available in `tests/test_contract.cairo`

---

**Built with ❤️ for the Healthcare ecosystem under C4GT**
