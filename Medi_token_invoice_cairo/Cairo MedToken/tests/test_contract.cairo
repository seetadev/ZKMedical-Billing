use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20MetadataDispatcher, IERC20MetadataDispatcherTrait};

// Test constants
const INITIAL_TOKENS: felt252 = 1000;
const DECIMAL_MULTIPLIER: u256 = 1000000000000000000; // 10^18

fn deploy_contract(initial_tokens: felt252, recipient: ContractAddress) -> ContractAddress {
    let contract = declare("MedToken").unwrap().contract_class();
    let constructor_calldata = array![initial_tokens, recipient.into()];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn get_test_addresses() -> (ContractAddress, ContractAddress, ContractAddress) {
    let owner: ContractAddress = 0x123.try_into().unwrap();
    let recipient: ContractAddress = 0x456.try_into().unwrap();
    let spender: ContractAddress = 0x789.try_into().unwrap();
    (owner, recipient, spender)
}

#[test]
fn test_constructor() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let erc20_metadata = IERC20MetadataDispatcher { contract_address };
    
    // Test metadata
    assert(erc20_metadata.name() == "Meditoken", 'Wrong name');
    assert(erc20_metadata.symbol() == "MED", 'Wrong symbol');
    assert(erc20_metadata.decimals() == 18, 'Wrong decimals');
    
    // Test initial supply
    let expected_supply = INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER;
    assert(erc20.total_supply() == expected_supply, 'Wrong total supply');
    assert(erc20.balance_of(recipient) == expected_supply, 'Wrong balance');
}

#[test]
fn test_transfer() {
    let (_owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let transfer_amount = 100 * DECIMAL_MULTIPLIER;
    
    // Transfer from recipient to spender
    start_cheat_caller_address(contract_address, recipient);
    let success = erc20.transfer(spender, transfer_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'Transfer failed');
    assert(erc20.balance_of(spender) == transfer_amount, 'Wrong spender balance');
    
    let expected_recipient_balance = (INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER) - transfer_amount;
    assert(erc20.balance_of(recipient) == expected_recipient_balance, 'Wrong recipient balance');
}

#[test]
#[should_panic(expected: ('ERC20: insufficient balance',))]
fn test_transfer_insufficient_balance() {
    let (_owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let transfer_amount = (INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER) + 1;
    
    // Try to transfer more than balance
    start_cheat_caller_address(contract_address, recipient);
    erc20.transfer(spender, transfer_amount);
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_approve_and_allowance() {
    let (_owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let approve_amount = 500 * DECIMAL_MULTIPLIER;
    
    // Approve spender to spend tokens
    start_cheat_caller_address(contract_address, recipient);
    let success = erc20.approve(spender, approve_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'Approve failed');
    assert(erc20.allowance(recipient, spender) == approve_amount, 'Wrong allowance');
}

#[test]
fn test_transfer_from() {
    let (owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let approve_amount = 500 * DECIMAL_MULTIPLIER;
    let transfer_amount = 300 * DECIMAL_MULTIPLIER;
    
    // First approve
    start_cheat_caller_address(contract_address, recipient);
    erc20.approve(spender, approve_amount);
    stop_cheat_caller_address(contract_address);
    
    // Then transfer from
    start_cheat_caller_address(contract_address, spender);
    let success = erc20.transfer_from(recipient, owner, transfer_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'TransferFrom failed');
    assert(erc20.balance_of(owner) == transfer_amount, 'Wrong owner balance');
    
    let remaining_allowance = approve_amount - transfer_amount;
    assert(erc20.allowance(recipient, spender) == remaining_allowance, 'Wrong allowance');
    
    let expected_recipient_balance = (INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER) - transfer_amount;
    assert(erc20.balance_of(recipient) == expected_recipient_balance, 'Wrong recipient balance');
}

#[test]
#[should_panic(expected: ('ERC20: insufficient allowance',))]
fn test_transfer_from_insufficient_allowance() {
    let (owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let approve_amount = 200 * DECIMAL_MULTIPLIER;
    let transfer_amount = 300 * DECIMAL_MULTIPLIER;
    
    // Approve less than transfer amount
    start_cheat_caller_address(contract_address, recipient);
    erc20.approve(spender, approve_amount);
    stop_cheat_caller_address(contract_address);
    
    // Try to transfer more than approved
    start_cheat_caller_address(contract_address, spender);
    erc20.transfer_from(recipient, owner, transfer_amount);
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_zero_transfer() {
    let (_, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    
    start_cheat_caller_address(contract_address, recipient);
    let success = erc20.transfer(spender, 0);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'Zero transfer should succeed');
    assert(erc20.balance_of(spender) == 0, 'Spender should have 0 balance');
}

#[test]
fn test_self_transfer() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let transfer_amount = 100 * DECIMAL_MULTIPLIER;
    let initial_balance = erc20.balance_of(recipient);
    
    start_cheat_caller_address(contract_address, recipient);
    let success = erc20.transfer(recipient, transfer_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'Self transfer failed');
    assert(erc20.balance_of(recipient) == initial_balance, 'Balance should remain same');
}

#[test]
fn test_multiple_approvals() {
    let (_owner, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let first_approve = 300 * DECIMAL_MULTIPLIER;
    let second_approve = 500 * DECIMAL_MULTIPLIER;
    
    start_cheat_caller_address(contract_address, recipient);
    
    // First approval
    erc20.approve(spender, first_approve);
    assert(erc20.allowance(recipient, spender) == first_approve, 'Wrong first allowance');
    
    // Second approval should overwrite
    erc20.approve(spender, second_approve);
    assert(erc20.allowance(recipient, spender) == second_approve, 'Wrong second allowance');
    
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_decimal_calculation() {
    let (_, recipient, _) = get_test_addresses();
    let test_tokens: felt252 = 5;
    let contract_address = deploy_contract(test_tokens, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    
    let expected_supply = test_tokens.into() * DECIMAL_MULTIPLIER;
    assert(erc20.total_supply() == expected_supply, 'Wrong decimal calc');
    assert(erc20.balance_of(recipient) == expected_supply, 'Wrong balance calc');
}