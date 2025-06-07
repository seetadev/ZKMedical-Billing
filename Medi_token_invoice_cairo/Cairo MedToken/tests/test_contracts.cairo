use starknet::{ContractAddress, contract_address_const};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait, IERC20MetadataDispatcher, IERC20MetadataDispatcherTrait};
use sn_medi_token::interfaces::IMedInvoice::{IMedInvoiceContractDispatcher, IMedInvoiceContractDispatcherTrait};

// Constants
const INITIAL_TOKENS: felt252 = 10000;
const DECIMAL_MULTIPLIER: u256 = 1000000000000000000; // 10^18
const SUBSCRIPTION_AMOUNT: u256 = 10000000000000000000; // 10 tokens
const SUBSCRIPTION_PERIOD: u64 = 365 * 24 * 60 * 60; // 365 days in seconds

// Helper functions for test addresses
fn OWNER() -> ContractAddress {
    contract_address_const::<'owner'>()
}

fn USER1() -> ContractAddress {
    contract_address_const::<'user1'>()
}

fn USER2() -> ContractAddress {
    contract_address_const::<'user2'>()
}

fn RECIPIENT() -> ContractAddress {
    contract_address_const::<'recipient'>()
}

// Deploy functions
fn deploy_meditoken() -> ContractAddress {
    let contract = declare("MedToken").unwrap().contract_class();
    let mut constructor_calldata = array![];
    constructor_calldata.append(INITIAL_TOKENS);
    constructor_calldata.append(USER1().into());
    
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn deploy_medinvoice(token_address: ContractAddress) -> ContractAddress {
    let contract = declare("MedInvoiceContract").unwrap().contract_class();
    let mut constructor_calldata = array![];
    constructor_calldata.append(token_address.into());
    constructor_calldata.append(OWNER().into());
    
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn setup_contracts() -> (ContractAddress, ContractAddress) {
    let token_address = deploy_meditoken();
    let invoice_address = deploy_medinvoice(token_address);
    
    // Give USER1 some tokens and approve the invoice contract
    let token = IERC20Dispatcher { contract_address: token_address };
    start_cheat_caller_address(token_address, USER1());
    token.approve(invoice_address, SUBSCRIPTION_AMOUNT * 2);
    stop_cheat_caller_address(token_address);
    
    (token_address, invoice_address)
}

// ========== MEDITOKEN TESTS ==========

#[test]
fn test_meditoken_deployment() {
    let contract_address = deploy_meditoken();
    let token = IERC20Dispatcher { contract_address };
    let metadata = IERC20MetadataDispatcher { contract_address };
    
    // Test initial supply
    let expected_supply = INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER;
    assert(token.total_supply() == expected_supply, 'Wrong total supply');
    
    // Test recipient balance
    assert(token.balance_of(USER1()) == expected_supply, 'Wrong recipient balance');
    
    // Test token metadata
    assert(metadata.name() == "Meditoken", 'Wrong token name');
    assert(metadata.symbol() == "MED", 'Wrong token symbol');
    assert(metadata.decimals() == 18, 'Wrong decimals');
}

#[test]
fn test_meditoken_transfer() {
    let contract_address = deploy_meditoken();
    let token = IERC20Dispatcher { contract_address };
    
    let transfer_amount = 100 * DECIMAL_MULTIPLIER;
    
    // Start impersonating USER1
    start_cheat_caller_address(contract_address, USER1());
    
    // Transfer tokens
    let success = token.transfer(USER2(), transfer_amount);
    assert(success, 'Transfer failed');
    
    // Check balances
    let user1_balance = token.balance_of(USER1());
    let user2_balance = token.balance_of(USER2());
    
    let expected_user1_balance = (INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER) - transfer_amount;
    assert(user1_balance == expected_user1_balance, 'Wrong user1 balance');
    assert(user2_balance == transfer_amount, 'Wrong user2 balance');
    
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_meditoken_approve_and_transfer_from() {
    let contract_address = deploy_meditoken();
    let token = IERC20Dispatcher { contract_address };
    
    let approve_amount = 50 * DECIMAL_MULTIPLIER;
    let transfer_amount = 30 * DECIMAL_MULTIPLIER;
    
    // USER1 approves USER2 to spend tokens
    start_cheat_caller_address(contract_address, USER1());
    let success = token.approve(USER2(), approve_amount);
    assert(success, 'Approve failed');
    stop_cheat_caller_address(contract_address);
    
    // Check allowance
    let allowance = token.allowance(USER1(), USER2());
    assert(allowance == approve_amount, 'Wrong allowance');
    
    // USER2 transfers from USER1 to OWNER
    start_cheat_caller_address(contract_address, USER2());
    let success = token.transfer_from(USER1(), OWNER(), transfer_amount);
    assert(success, 'Transfer from failed');
    stop_cheat_caller_address(contract_address);
    
    // Check balances and allowance
    let owner_balance = token.balance_of(OWNER());
    let remaining_allowance = token.allowance(USER1(), USER2());
    
    assert(owner_balance == transfer_amount, 'Wrong owner balance');
    assert(remaining_allowance == approve_amount - transfer_amount, 'Wrong remaining allowance');
}

// ========== MEDINVOICE TESTS ==========

#[test]
fn test_medinvoice_deployment() {
    let (_token_address, invoice_address) = setup_contracts();
    let invoice = IMedInvoiceContractDispatcher { contract_address: invoice_address };
    
    // Test that contract is deployed correctly
    start_cheat_caller_address(invoice_address, USER1());
    let user_tokens = invoice.get_user_tokens();
    let expected_tokens = INITIAL_TOKENS.into() * DECIMAL_MULTIPLIER;
    assert(user_tokens == expected_tokens, 'Wrong user balance');
    stop_cheat_caller_address(invoice_address);
}

#[test]
fn test_save_file_success() {
    let (_token_address, invoice_address) = setup_contracts();
    let invoice = IMedInvoiceContractDispatcher { contract_address: invoice_address };
    
    let file_content: ByteArray = "Test medical record";
    
    start_cheat_caller_address(invoice_address, USER1());
    invoice.save_file(file_content.clone());
    
    let files = invoice.get_files();
    assert(files.len() == 1, 'Wrong number of files');
    assert(files.at(0).clone() == file_content, 'Wrong file content');
    stop_cheat_caller_address(invoice_address);
}

#[test]
fn test_subscription_success() {
    let (token_address, invoice_address) = setup_contracts();
    let invoice = IMedInvoiceContractDispatcher { contract_address: invoice_address };
    let token = IERC20Dispatcher { contract_address: token_address };
    
    // Check initial subscription status
    start_cheat_caller_address(invoice_address, USER1());
    assert(!invoice.is_subscribed(USER1()), 'Not subscribed initially');
    
    let initial_balance = token.balance_of(USER1());
    
    // Subscribe
    invoice.subscribe();
    
    // Check subscription status
    assert(invoice.is_subscribed(USER1()), 'Should be subscribed');
    
    // Check token balance decreased
    let final_balance = token.balance_of(USER1());
    assert(final_balance == initial_balance - SUBSCRIPTION_AMOUNT, 'Wrong token balance');
    
    stop_cheat_caller_address(invoice_address);
}

#[test]
fn test_withdraw_tokens_by_owner() {
    let (token_address, invoice_address) = setup_contracts();
    let invoice = IMedInvoiceContractDispatcher { contract_address: invoice_address };
    let token = IERC20Dispatcher { contract_address: token_address };
    
    // User subscribes to add tokens to contract
    start_cheat_caller_address(invoice_address, USER1());
    invoice.subscribe();
    stop_cheat_caller_address(invoice_address);
    
    // Check contract balance
    let contract_balance = token.balance_of(invoice_address);
    assert(contract_balance == SUBSCRIPTION_AMOUNT, 'Wrong contract balance');
    
    // Owner withdraws tokens
    let withdraw_amount = SUBSCRIPTION_AMOUNT / 2;
    start_cheat_caller_address(invoice_address, OWNER());
    invoice.withdraw_tokens(withdraw_amount);
    
    // Check balances
    let owner_balance = token.balance_of(OWNER());
    let new_contract_balance = token.balance_of(invoice_address);
    
    assert(owner_balance == withdraw_amount, 'Wrong owner balance');
    assert(new_contract_balance == SUBSCRIPTION_AMOUNT - withdraw_amount, 'Wrong contract balance');
    
    stop_cheat_caller_address(invoice_address);
}