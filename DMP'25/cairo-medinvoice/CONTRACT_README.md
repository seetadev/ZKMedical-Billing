# ParkPro Invoice Contract

A Cairo smart contract for managing file storage with a subscription-based plan system on StarkNet. Users can purchase file storage capacity using PPT tokens and store file metadata with IPFS integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Contract Structure](#contract-structure)
- [Subscription Plans](#subscription-plans)
- [Core Features](#core-features)
- [Function Reference](#function-reference)
- [Events](#events)
- [Storage Layout](#storage-layout)
- [Usage Examples](#usage-examples)
- [Security Features](#security-features)

## 🔍 Overview

The ParkPro Invoice Contract enables users to:

- Purchase file storage capacity through subscription plans
- Store file metadata (name, IPFS CID, timestamp) on-chain
- Accumulate storage capacity by purchasing plans multiple times
- Track usage and purchase history
- Manage subscriptions with PPT token payments

## 🏗️ Contract Structure

```
ParkProInvoiceContract/
├── Components/
│   ├── OwnableComponent (Access Control)
│   └── ReentrancyGuardComponent (Security)
├── Storage/
│   ├── File Management
│   ├── Subscription Plans
│   └── User Data
├── Functions/
│   ├── File Operations
│   ├── Plan Management
│   └── Admin Functions
└── Events/
    ├── FileSaved
    ├── PlanSubscription
    └── NewSubscription
```

## 💳 Subscription Plans

| Plan ID | Name          | Cost (PPT) | Files Allowed | Use Case       |
| ------- | ------------- | ---------- | ------------- | -------------- |
| 1       | Basic Plan    | 1 token    | 5 files       | Personal use   |
| 2       | Standard Plan | 10 tokens  | 50 files      | Small business |
| 3       | Premium Plan  | 50 tokens  | 250 files     | Enterprise     |

### 🔄 Cumulative Purchases

- Users can purchase the same plan multiple times
- File limits are **additive** (not replaced)
- Example: Buying Basic Plan 3x = 15 files total

## ✨ Core Features

### 🗂️ File Management

- Store file metadata on-chain
- IPFS integration for decentralized storage
- File limit enforcement based on subscription
- Unique file ID generation per user

### 💰 Token Integration

- PPT (ParkPro Token) ERC20 integration
- Approval-based token transfers
- Owner token withdrawal functionality

### 🔐 Security

- Reentrancy protection on all state-changing functions
- Owner-only administrative functions
- Input validation and error handling

## 📚 Function Reference

### File Operations

```cairo
// Save a file (requires available storage)
fn save_file(file_name: ByteArray, ipfs_cid: ByteArray)

// Get all files for a user
fn get_files(user_address: ContractAddress) -> Array<FileRecord>

// Check user's file usage
fn get_user_file_limits(user: ContractAddress) -> (u64, u64) // (used, allowed)
```

### Plan Management

```cairo
// Purchase a subscription plan
fn subscribe_to_plan(plan_id: u8)

// Get plan details
fn get_subscription_plan(plan_id: u8) -> SubscriptionPlan

// Get all available plans
fn get_all_plans() -> Array<SubscriptionPlan>

// Check user's plan purchases
fn get_user_plan_purchases(user: ContractAddress, plan_id: u8) -> u64
```

### User Information

```cairo
// Get comprehensive user summary
fn get_user_subscription_summary(user: ContractAddress) -> (u64, u64, u8)
// Returns: (files_used, files_allowed, current_plan_id)

// Check token balance
fn get_user_tokens(user_address: ContractAddress) -> u256
```

### Legacy Functions

```cairo
// Old subscription system (still supported)
fn subscribe() // 10 tokens for time-based subscription
fn is_subscribed(user: ContractAddress) -> bool
fn get_subscription_details(user_address: ContractAddress) -> (bool, u64)
```

### Admin Functions

```cairo
// Withdraw collected tokens (owner only)
fn withdraw_tokens(amount: u256)
```

## 📡 Events

### FileSaved

```cairo
struct FileSaved {
    user: ContractAddress,     // File owner
    file_id: u64,             // Unique file ID
    file_name: ByteArray,     // File name
    ipfs_cid: ByteArray,      // IPFS content ID
    timestamp: u64,           // Save timestamp
}
```

### PlanSubscription

```cairo
struct PlanSubscription {
    subscriber: ContractAddress,  // User who purchased
    plan_id: u8,                 // Plan purchased
    files_allowed: u64,          // Total files after purchase
    cost: u256,                  // Amount paid
}
```

## 🗄️ Storage Layout

```cairo
struct Storage {
    // File Management
    file_records: Map<(ContractAddress, u64), FileRecord>,
    file_counter: Map<ContractAddress, u64>,

    // Token & Legacy
    ppt_token_address: ContractAddress,
    subscription_end_times: Map<ContractAddress, u64>,

    // Subscription Plans
    subscription_plans: Map<u8, SubscriptionPlan>,
    user_files_allowed: Map<ContractAddress, u64>,
    user_current_plan: Map<ContractAddress, u8>,
    user_plan_purchases: Map<(ContractAddress, u8), u64>,

    // Components
    ownable: OwnableComponent::Storage,
    reentrancy: ReentrancyGuardComponent::Storage,
}
```

## 💡 Usage Examples

### Basic Usage Flow

```typescript
// 1. Check available plans
const plans = await contract.get_all_plans();

// 2. Purchase a plan (user must approve tokens first)
await pptToken.approve(contractAddress, planCost);
await contract.subscribe_to_plan(1); // Buy Basic Plan

// 3. Check your limits
const [used, allowed] = await contract.get_user_file_limits(userAddress);

// 4. Save a file
await contract.save_file("invoice.pdf", "QmHash123...");

// 5. Retrieve files
const files = await contract.get_files(userAddress);
```

### Advanced Usage

```typescript
// Buy multiple plans for more storage
await contract.subscribe_to_plan(1); // +5 files
await contract.subscribe_to_plan(1); // +5 files (total: 10)
await contract.subscribe_to_plan(2); // +50 files (total: 60)

// Check purchase history
const basicPurchases = await contract.get_user_plan_purchases(userAddress, 1);
// Returns: 2 (bought Basic Plan twice)

// Get complete summary
const [used, allowed, currentPlan] = await contract.get_user_subscription_summary(userAddress);
```

## 🔒 Security Features

### Access Control

- **Owner Functions**: Only contract owner can withdraw tokens
- **User Functions**: Users can only access their own files

### Reentrancy Protection

- All state-changing functions use reentrancy guards
- Prevents common attack vectors

### Input Validation

- File names and IPFS CIDs cannot be empty
- Plan IDs must be valid (1, 2, or 3)
- Sufficient token balance checks

### DoS Prevention

- Maximum file count limit (1000 files per user)
- Efficient storage patterns

## 🚀 Deployment Requirements

### Constructor Parameters

```cairo
constructor(
    ppt_token: ContractAddress,      // PPT token contract address
    initial_owner: ContractAddress   // Contract owner address
)
```

### Dependencies

- OpenZeppelin Cairo Contracts
- PPT ERC20 Token Contract
- StarkNet Cairo environment

## 📊 Gas Optimization

- Efficient storage mappings
- Minimal external calls
- Batched operations where possible
- Event emission for off-chain indexing

## 🔄 Upgrade Path

The contract includes:

- Modular component design
- Clear separation of concerns
- Event-driven architecture for external integrations
- Backward compatibility with legacy subscription system

---

**Note**: This contract maintains backward compatibility with the original time-based subscription system while introducing the new file-based plan system.
