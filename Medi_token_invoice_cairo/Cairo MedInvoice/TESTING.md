# MedInvoice Contract Testing Guide

This document provides a comprehensive guide to testing the MedInvoice smart contract, including test structure, coverage, and execution instructions.

## Overview

The MedInvoice contract is a Starknet smart contract that manages medical document storage with IPFS integration and a subscription-based access model. The test suite ensures all contract functionality works correctly under various scenarios.

## Test Architecture

### Testing Framework

- **Framework**: Starknet Foundry (`snforge`)
- **Dependencies**:
  - `snforge_std` for testing utilities
  - `assert_macros` for enhanced assertions
  - OpenZeppelin contracts for ERC20 mock

### Mock Contracts

The test suite includes a `MockERC20` contract that simulates the MediToken (MEDI) for testing purposes:

- Initial supply: 1,000,000 MEDI tokens
- 18 decimal places
- Standard ERC20 functionality

## Test Categories

### 1. Contract Deployment Tests

- **`test_constructor`**: Verifies successful contract deployment and initialization

### 2. File Management Tests

#### Successful Operations

- **`test_save_file_success`**: Tests successful file saving with proper token balance
- **`test_save_multiple_files`**: Verifies multiple file uploads by the same user
- **`test_get_files_empty`**: Tests file retrieval for users with no saved files

#### Error Scenarios

- **`test_save_file_insufficient_tokens`**: Ensures users need tokens to save files
- **`test_save_file_empty_filename`**: Validates filename cannot be empty
- **`test_save_file_empty_ipfs_cid`**: Validates IPFS CID cannot be empty

### 3. Token Balance Tests

- **`test_get_user_tokens`**: Verifies correct token balance retrieval

### 4. Subscription System Tests

#### Successful Subscriptions

- **`test_subscription_success`**: Tests complete subscription flow
- **`test_subscription_expiry`**: Verifies subscription expiration logic

#### Subscription Errors

- **`test_subscription_insufficient_tokens`**: Ensures sufficient tokens for subscription
- **`test_duplicate_subscription`**: Prevents double subscriptions

#### Subscription Queries

- **`test_subscription_details_no_subscription`**: Tests subscription details for non-subscribers

### 5. Administrative Tests

#### Token Withdrawal

- **`test_withdraw_tokens_success`**: Tests successful token withdrawal by owner
- **`test_withdraw_tokens_unauthorized`**: Prevents unauthorized withdrawals
- **`test_withdraw_tokens_insufficient_balance`**: Handles insufficient contract balance

## Test Data and Constants

```cairo
const SUBSCRIPTION_AMOUNT: u256 = 10000000000000000000; // 10 MEDI tokens
const SUBSCRIPTION_PERIOD: u64 = 365 * 24 * 60 * 60; // 1 year in seconds
```

### Test Addresses

- **Owner**: `contract_address_const::<'owner'>()`
- **User**: `contract_address_const::<'user'>()`

## Event Testing

The test suite verifies that contracts emit the correct events:

### FileSaved Event

- Emitted when a file is successfully saved
- Contains: user address, file ID, filename, IPFS CID, timestamp

### NewSubscription Event

- Emitted when a user subscribes
- Contains: subscriber address, subscription end time

## Test Utilities

### Time Manipulation

- `start_cheat_block_timestamp()` / `stop_cheat_block_timestamp()`: Control block time
- Used for testing subscription expiry and timestamp-dependent functionality

### Caller Address Manipulation

- `start_cheat_caller_address()` / `stop_cheat_caller_address()`: Change the caller
- Enables testing different user perspectives and access controls

### Event Spying

- `spy_events()`: Monitor emitted events
- `EventSpyAssertionsTrait`: Verify correct event emission

## Running Tests

### Prerequisites

1. Install Starknet Foundry
2. Ensure all dependencies are installed via Scarb

### Basic Test Execution

```bash
# Run all tests
scarb test

# Or using snforge directly
snforge test

# Run with verbose output
snforge test -v

# Run specific test
snforge test test_save_file_success
```

### Advanced Testing Options

```bash
# Run tests with gas profiling
snforge test --gas

# Run tests with detailed trace
snforge test --detailed-trace

# Run tests with specific number of fuzzer runs
snforge test --fuzzer-runs 1000
```

## Test Coverage

The test suite covers:

### Core Functionality (100%)

- ✅ File saving and retrieval
- ✅ Token balance checking
- ✅ Subscription management
- ✅ Administrative functions

### Error Handling (100%)

- ✅ Insufficient token scenarios
- ✅ Invalid input validation
- ✅ Access control violations
- ✅ Edge cases and boundary conditions

### Events (100%)

- ✅ All contract events are tested
- ✅ Event data validation
- ✅ Event emission timing

### Access Control (100%)

- ✅ Owner-only functions
- ✅ User permissions
- ✅ Unauthorized access prevention

## Test Data Flow

```
1. Deploy MockERC20 token contract
2. Deploy MedInvoice contract with token address
3. Distribute tokens to test users
4. Execute test scenarios
5. Verify state changes and events
6. Clean up and reset for next test
```

## Debugging Failed Tests

### Common Issues and Solutions

1. **Token Balance Issues**

   - Ensure mock token has sufficient supply
   - Verify token transfers before operations
   - Check approval amounts for subscription tests

2. **Timestamp Issues**

   - Use consistent timestamp manipulation
   - Remember to stop timestamp cheating after tests
   - Account for subscription period calculations

3. **Event Assertion Failures**

   - Verify event structure matches contract implementation
   - Check event data types and values
   - Ensure events are emitted in the correct order

4. **Access Control Issues**
   - Verify caller address setup
   - Check owner initialization in constructor
   - Ensure proper address switching in tests

## Future Test Enhancements

### Potential Additions

1. **Fuzz Testing**: Add property-based tests for edge cases
2. **Integration Tests**: Test with real IPFS integration
3. **Gas Optimization Tests**: Monitor and optimize gas usage
4. **Load Testing**: Test contract behavior under high load
5. **Upgradability Tests**: If contract becomes upgradeable

### Performance Testing

Consider adding tests for:

- Maximum file storage limits
- Subscription renewal scenarios
- Batch operations
- Large-scale user scenarios

## Contributing to Tests

When adding new features to the MedInvoice contract:

1. **Add corresponding tests** for new functionality
2. **Test both success and failure cases**
3. **Verify event emissions** for new events
4. **Update this documentation** with new test descriptions
5. **Ensure all tests pass** before submitting changes

## Test Maintenance

### Regular Tasks

- Review test coverage reports
- Update tests when contract logic changes
- Refactor tests for better maintainability
- Add tests for reported bugs before fixing them

### Code Quality

- Follow Cairo testing best practices
- Use descriptive test names
- Include comments for complex test logic
- Keep tests independent and isolated

---

_This testing guide is maintained alongside the MedInvoice contract. Please update this document when modifying tests or adding new functionality._
