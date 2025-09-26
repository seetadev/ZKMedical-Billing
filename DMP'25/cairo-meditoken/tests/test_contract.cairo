use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20MetadataDispatcher, IERC20MetadataDispatcherTrait};

// Interface for airdrop functions
#[starknet::interface]
trait IAirdrop<TContractState> {
    fn claim_airdrop(ref self: TContractState);
    fn has_claimed_airdrop(self: @TContractState, address: ContractAddress) -> bool;
    fn get_airdrop_count(self: @TContractState) -> u32;
    fn get_remaining_airdrops(self: @TContractState) -> u32;
}

// Test constants
const INITIAL_TOKENS: felt252 = 1000;
const DECIMAL_MULTIPLIER: u256 = 1000000000000000000; // 10^18
const AIRDROP_AMOUNT: u256 = 25000000000000000000; // 25 MED tokens
const MAX_AIRDROP_RECIPIENTS: u32 = 20;

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
    assert(erc20_metadata.name() == "PPT Token", 'Wrong name');
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

// ============ AIRDROP TESTS ============

#[test]
fn test_airdrop_claim_successful() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let airdrop = IAirdropDispatcher { contract_address };
    
    let claimer: ContractAddress = 0x999.try_into().unwrap();
    let initial_balance = erc20.balance_of(claimer);
    let initial_total_supply = erc20.total_supply();
    
    // Claim airdrop
    start_cheat_caller_address(contract_address, claimer);
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
    
    // Verify balances
    assert(erc20.balance_of(claimer) == initial_balance + AIRDROP_AMOUNT, 'Wrong claimer balance');
    assert(erc20.total_supply() == initial_total_supply + AIRDROP_AMOUNT, 'Wrong total supply');
    
    // Verify airdrop state
    assert(airdrop.has_claimed_airdrop(claimer), 'Should be marked as claimed');
    assert(airdrop.get_airdrop_count() == 1, 'Wrong airdrop count');
    assert(airdrop.get_remaining_airdrops() == MAX_AIRDROP_RECIPIENTS - 1, 'Wrong remaining count');
}

#[test]
#[should_panic(expected: ('Already claimed airdrop',))]
fn test_airdrop_double_claim() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let airdrop = IAirdropDispatcher { contract_address };
    let claimer: ContractAddress = 0x999.try_into().unwrap();
    
    // First claim
    start_cheat_caller_address(contract_address, claimer);
    airdrop.claim_airdrop();
    
    // Second claim should fail
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_multiple_airdrop_claims() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let airdrop = IAirdropDispatcher { contract_address };
    
    let claimer1: ContractAddress = 0x111.try_into().unwrap();
    let claimer2: ContractAddress = 0x222.try_into().unwrap();
    let claimer3: ContractAddress = 0x333.try_into().unwrap();
    
    let initial_total_supply = erc20.total_supply();
    
    // Multiple claims
    start_cheat_caller_address(contract_address, claimer1);
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
    
    start_cheat_caller_address(contract_address, claimer2);
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
    
    start_cheat_caller_address(contract_address, claimer3);
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
    
    // Verify all balances
    assert(erc20.balance_of(claimer1) == AIRDROP_AMOUNT, 'Wrong claimer1 balance');
    assert(erc20.balance_of(claimer2) == AIRDROP_AMOUNT, 'Wrong claimer2 balance');
    assert(erc20.balance_of(claimer3) == AIRDROP_AMOUNT, 'Wrong claimer3 balance');
    
    // Verify total supply increased correctly
    let expected_supply = initial_total_supply + (3 * AIRDROP_AMOUNT);
    assert(erc20.total_supply() == expected_supply, 'Wrong total supply');
    
    // Verify airdrop state
    assert(airdrop.get_airdrop_count() == 3, 'Wrong airdrop count');
    assert(airdrop.get_remaining_airdrops() == MAX_AIRDROP_RECIPIENTS - 3, 'Wrong remaining count');
    assert(airdrop.has_claimed_airdrop(claimer1), 'Claimer1 not marked');
    assert(airdrop.has_claimed_airdrop(claimer2), 'Claimer2 not marked');
    assert(airdrop.has_claimed_airdrop(claimer3), 'Claimer3 not marked');
}

#[test]
fn test_airdrop_check_unclaimed_address() {
    let (_, recipient, _) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let airdrop = IAirdropDispatcher { contract_address };
    let unclaimed_address: ContractAddress = 0x555.try_into().unwrap();
    
    // Should not be claimed initially
    assert(!airdrop.has_claimed_airdrop(unclaimed_address), 'Should not be claimed');
    
    // Count should be 0 initially
    assert(airdrop.get_airdrop_count() == 0, 'Initial count should be 0');
    assert(airdrop.get_remaining_airdrops() == MAX_AIRDROP_RECIPIENTS, 'Should have max remaining');
}

#[test]
fn test_airdrop_integration_with_erc20() {
    let (_, recipient, spender) = get_test_addresses();
    let contract_address = deploy_contract(INITIAL_TOKENS, recipient);
    
    let erc20 = IERC20Dispatcher { contract_address };
    let airdrop = IAirdropDispatcher { contract_address };
    
    let claimer: ContractAddress = 0x777.try_into().unwrap();
    
    // Claim airdrop
    start_cheat_caller_address(contract_address, claimer);
    airdrop.claim_airdrop();
    stop_cheat_caller_address(contract_address);
    
    // Verify claimer can use ERC20 functions with airdropped tokens
    let transfer_amount = 10 * DECIMAL_MULTIPLIER;
    
    // Transfer some airdropped tokens
    start_cheat_caller_address(contract_address, claimer);
    let success = erc20.transfer(spender, transfer_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success, 'Transfer should succeed');
    assert(erc20.balance_of(spender) == transfer_amount, 'Wrong spender balance');
    assert(erc20.balance_of(claimer) == AIRDROP_AMOUNT - transfer_amount, 'Wrong claimer balance');
    
    // Approve and transfer_from with airdropped tokens
    let approve_amount = 5 * DECIMAL_MULTIPLIER;
    
    start_cheat_caller_address(contract_address, claimer);
    erc20.approve(spender, approve_amount);
    stop_cheat_caller_address(contract_address);
    
    start_cheat_caller_address(contract_address, spender);
    let success2 = erc20.transfer_from(claimer, recipient, approve_amount);
    stop_cheat_caller_address(contract_address);
    
    assert(success2, 'TransferFrom should succeed');
    let expected_balance = (INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER) + approve_amount;
    assert(erc20.balance_of(recipient) == expected_balance, 'Wrong final recipient balance');
}