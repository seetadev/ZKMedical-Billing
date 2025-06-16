# MedToken Test Suite

This directory contains comprehensive unit tests for the MedToken and MedInvoice smart contracts using Starknet Foundry (`snforge`).

## Test Structure

### Current Tests

The test suite covers the following functionality:

#### MedToken Contract Tests
1. **test_meditoken_deployment** - Verifies proper deployment, initial supply, and metadata
2. **test_meditoken_transfer** - Tests basic token transfer functionality
3. **test_meditoken_approve_and_transfer_from** - Tests approval and transfer_from mechanisms

#### MedInvoice Contract Tests
1. **test_medinvoice_deployment** - Verifies proper deployment and token integration
2. **test_save_file_success** - Tests file saving functionality
3. **test_subscription_success** - Tests subscription payment and status
4. **test_withdraw_tokens_by_owner** - Tests owner token withdrawal functionality

## Running Tests

### Prerequisites
- Starknet Foundry installed (`snforge`)
- OpenZeppelin Cairo contracts dependency

### Commands

Run all tests:
```bash
snforge test
```

Run specific test:
```bash
snforge test test_meditoken_deployment
```

Run tests with verbose output:
```bash
snforge test -v
```

Run tests with gas reporting:
```bash
snforge test --gas-report
```

## Test Coverage

### MedToken Contract Coverage
- ✅ Deployment and initialization
- ✅ ERC20 metadata (name, symbol, decimals)
- ✅ Basic transfers
- ✅ Approval and transfer_from
- ⚠️ Need to add: Insufficient balance edge cases
- ⚠️ Need to add: Zero transfer edge cases

### MedInvoice Contract Coverage
- ✅ Deployment with token integration
- ✅ File saving with token validation
- ✅ Subscription payment processing
- ✅ Owner token withdrawal
- ⚠️ Need to add: Empty file rejection
- ⚠️ Need to add: Insufficient token edge cases
- ⚠️ Need to add: Multiple file management
- ⚠️ Need to add: User isolation tests
- ⚠️ Need to add: Subscription expiry tests

## Adding New Tests

To add new tests:

1. Add test functions to `/tests/test_contracts.cairo`
2. Follow the naming convention: `test_[contract]_[functionality]`
3. Use helper functions for contract deployment
4. Use `start_cheat_caller_address` for user impersonation
5. Include proper assertions with descriptive error messages

### Test Function Template

```cairo
#[test]
fn test_your_functionality() {
    // Setup
    let (token_address, invoice_address) = setup_contracts();
    let contract = SomeDispatcher { contract_address };
    
    // Action
    start_cheat_caller_address(contract_address, USER1());
    contract.some_function();
    stop_cheat_caller_address(contract_address);
    
    // Assertions
    assert(condition, 'Error message');
}
```

### Error Test Template

For tests that should panic:

```cairo
#[test]
#[should_panic(expected: ('Error message',))]
fn test_your_error_case() {
    // Setup that should cause panic
    let contract = SomeDispatcher { contract_address };
    contract.function_that_should_fail();
}
```

## Gas Usage

Each test reports gas usage in the format:
- `l1_gas`: Layer 1 gas cost
- `l1_data_gas`: Layer 1 data gas cost
- `l2_gas`: Layer 2 gas cost

Monitor these values to ensure contract efficiency.

## Constants Used in Tests

- `INITIAL_TOKENS`: 10000 (tokens to mint initially)
- `DECIMAL_MULTIPLIER`: 10^18 (token decimal places)
- `SUBSCRIPTION_AMOUNT`: 10 * 10^18 (10 tokens for subscription)
- `SUBSCRIPTION_PERIOD`: 365 days in seconds

## Test Addresses

The tests use the following consistent addresses:
- `OWNER()`: Contract owner
- `USER1()`: Primary test user (receives initial tokens)
- `USER2()`: Secondary test user
- `RECIPIENT()`: Token recipient in some tests

These are generated using `contract_address_const` with string identifiers.
