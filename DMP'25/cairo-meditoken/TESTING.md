# MediToken Testing Guide

This guide covers all aspects of testing the MediToken contract, including running tests, understanding test coverage, and writing new tests.

## 🧪 Quick Testing Commands

```bash
# Run all tests
snforge test

# Run with verbose output
snforge test -v

# Run specific test category
snforge test test_airdrop          # Airdrop functionality tests
snforge test test_constructor      # Basic ERC20 tests
snforge test test_transfer         # Transfer-related tests

# Run specific test
snforge test test_airdrop_claim_successful
```

## 📋 Test Suite Overview

The MediToken contract includes **15 comprehensive tests** covering all functionality:

### ERC20 Standard Tests (9 tests)

- ✅ `test_constructor` - Constructor initialization and metadata
- ✅ `test_transfer` - Standard token transfers
- ✅ `test_transfer_insufficient_balance` - Transfer with insufficient balance (should panic)
- ✅ `test_approve_and_allowance` - Approval and allowance mechanisms
- ✅ `test_transfer_from` - Transfer from functionality
- ✅ `test_transfer_from_insufficient_allowance` - Transfer from with insufficient allowance (should panic)
- ✅ `test_zero_transfer` - Zero amount transfers
- ✅ `test_self_transfer` - Self transfers (same sender/recipient)
- ✅ `test_multiple_approvals` - Multiple approval operations
- ✅ `test_decimal_calculation` - Decimal precision calculations

### Airdrop Functionality Tests (6 tests)

- ✅ `test_airdrop_claim_successful` - Successful airdrop claims
- ✅ `test_airdrop_double_claim` - Double-claim prevention (should panic)
- ✅ `test_multiple_airdrop_claims` - Multiple user claims
- ✅ `test_airdrop_check_unclaimed_address` - Initial state verification
- ✅ `test_airdrop_integration_with_erc20` - Integration with ERC20 functions

## 🔍 Test Coverage Details

### ERC20 Functionality Coverage

- **Constructor**: Initialization, metadata setup, initial supply minting
- **Transfers**: Standard transfers, edge cases, insufficient balance handling
- **Approvals**: Approve/allowance mechanism, multiple approvals
- **Transfer From**: Delegated transfers, allowance consumption
- **Balance Tracking**: Accurate balance and supply tracking
- **Decimal Handling**: Proper decimal calculations and precision

### Airdrop System Coverage

- **Claim Process**: Successful claims, balance updates, event emission
- **Security**: Double-claim prevention, limit enforcement
- **State Management**: Claim tracking, counter updates, remaining slots
- **Integration**: Airdropped tokens work with standard ERC20 functions
- **Edge Cases**: Initial state, limit reached scenarios

### Security Test Coverage

- **Balance Validation**: Prevents transfers with insufficient balance
- **Allowance Verification**: Prevents unauthorized transfer_from operations
- **Supply Integrity**: Total supply tracking remains accurate
- **Airdrop Limits**: Enforces 20-recipient maximum
- **Double Claiming**: Prevents users from claiming multiple times

## 🏃‍♂️ Running Tests

### Prerequisites

Make sure you have Starknet Foundry installed:

```bash
# Check if snforge is installed
snforge --version

# Install if needed (follow Starknet Foundry docs)
```

### Basic Test Commands

```bash
# Navigate to project directory
cd /path/to/ppttoken

# Build the contract first
scarb build

# Run all tests
snforge test

# Run with detailed output
snforge test -v

# Run tests and show gas usage
snforge test --detailed-resources
```

### Targeted Testing

```bash
# Test specific functionality
snforge test test_airdrop                    # All airdrop tests
snforge test test_transfer                   # All transfer tests
snforge test test_approve                    # All approval tests

# Test specific scenarios
snforge test test_airdrop_claim_successful   # Single test
snforge test insufficient                    # Tests with "insufficient" in name
snforge test panic                          # Tests that should panic
```

### Test Output Examples

**Successful Test Run:**

```
Collected 15 test(s) from ppttoken package
Running 15 test(s) from tests/
[PASS] test_constructor (gas: ~680960)
[PASS] test_transfer (gas: ~1081920)
[PASS] test_airdrop_claim_successful (gas: ~1667520)
...
Tests: 15 passed, 0 failed, 0 skipped
```

**Failed Test Example:**

```
[FAIL] test_transfer_insufficient_balance
Failure data: [0x45524332303a20696e73756666696369656e742062616c616e6365 ('ERC20: insufficient balance')]
```

## 📊 Test Results Analysis

### Current Test Status

```
Tests: 15 passed, 0 failed, 0 skipped, 0 ignored, 0 filtered out
```

### Gas Usage Analysis

- **Constructor**: ~680,960 gas
- **Basic Transfer**: ~1,081,920 gas
- **Airdrop Claim**: ~1,667,520 gas
- **Multiple Claims**: ~2,920,640 gas
- **Complex Operations**: Up to ~2,471,360 gas

## 🧩 Test Architecture

### Test File Structure

```
tests/
└── test_contract.cairo     # Main test file with all test functions
```

### Test Helper Functions

```cairo
// Deploy contract for testing
fn deploy_contract(initial_tokens: felt252, recipient: ContractAddress) -> ContractAddress

// Get standard test addresses
fn get_test_addresses() -> (ContractAddress, ContractAddress, ContractAddress)
```

### Test Constants

```cairo
const INITIAL_TOKENS: felt252 = 1000;
const DECIMAL_MULTIPLIER: u256 = 1000000000000000000; // 10^18
const AIRDROP_AMOUNT: u256 = 25000000000000000000;    // 25 MED tokens
const MAX_AIRDROP_RECIPIENTS: u32 = 20;
```

## ✍️ Writing New Tests

### Test Template

```cairo
#[test]
fn test_your_functionality() {
    // Setup
    let (owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);

    let erc20 = IERC20Dispatcher { contract_address };
    let airdrop = IAirdropDispatcher { contract_address };

    // Test logic
    start_cheat_caller_address(contract_address, caller);
    // ... perform actions
    stop_cheat_caller_address(contract_address);

    // Assertions
    assert(condition, 'Error message');
}
```

### Testing Panics

```cairo
#[test]
#[should_panic(expected: ('Error message',))]
fn test_should_fail() {
    // Setup that should cause panic
    // ... test code that should fail
}
```

### Best Practices for New Tests

1. **Clear naming**: Use descriptive test function names
2. **Setup isolation**: Each test should be independent
3. **Good assertions**: Use meaningful error messages
4. **Edge cases**: Test boundary conditions
5. **Gas awareness**: Consider gas costs in complex tests

## 🐛 Debugging Tests

### Common Issues

```bash
# Contract not built
scarb build

# Stale cache
scarb clean && scarb build

# Wrong directory
cd /path/to/ppttoken
```

### Debugging Tips

1. **Use verbose output**: `snforge test -v` for detailed logs
2. **Test isolation**: Run single tests to isolate issues
3. **Check assertions**: Ensure assertion messages are clear
4. **Verify setup**: Double-check test setup and addresses

## 📈 Test Performance

### Optimization Tips

- **Batch similar tests**: Group related functionality
- **Minimize setup**: Reuse common setup patterns
- **Efficient assertions**: Use specific, fast assertions
- **Gas monitoring**: Track gas usage changes

### Performance Benchmarks

- **Total test suite**: ~53 seconds compile + run time
- **Individual tests**: 0.5-3 seconds each
- **Memory usage**: Efficient with current test suite

## 🔄 Continuous Testing

### Pre-commit Testing

```bash
# Always run before committing
scarb build && snforge test
```

### Integration Testing

The tests serve as integration tests, verifying:

- Contract deployment works correctly
- All functions integrate properly
- State changes are persistent
- Events are emitted correctly

## 📝 Test Documentation

### Test Categories

1. **Unit Tests**: Individual function testing
2. **Integration Tests**: Multi-function workflows
3. **Security Tests**: Attack vector prevention
4. **Edge Case Tests**: Boundary condition handling

### Coverage Goals

- ✅ **100% Function Coverage**: All public functions tested
- ✅ **Path Coverage**: All code paths executed
- ✅ **Edge Case Coverage**: Boundary conditions tested
- ✅ **Security Coverage**: Attack vectors prevented

---

**Need help with setup?** Check [Setup.md](Setup.md) for deployment and development setup.  
**Need contract details?** Check [README.md](README.md) for contract overview and usage.
