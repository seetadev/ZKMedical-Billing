use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address
};
use starknet::{ContractAddress, contract_address_const};
use sn_parkpro_invoice::interfaces::IParkProInvoice::{IParkProInvoiceContractDispatcher, IParkProInvoiceContractDispatcherTrait};

// Simple test to verify basic contract functionality
#[test]
fn test_get_files_empty() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let user: ContractAddress = contract_address_const::<'user'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract with mock token address
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // Test that getting files for a user with no files returns empty array
    let files = parkpro_invoice.get_files(user);
    assert!(files.len() == 0, "Expected empty files array");
}

#[test]
fn test_subscription_details_no_subscription() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let user: ContractAddress = contract_address_const::<'user'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // Check subscription details for user without subscription
    let (exists, end_time) = parkpro_invoice.get_subscription_details(user);
    assert!(exists == false, "User should not have subscription");
    assert!(end_time == 0, "End time should be 0");
    
    assert!(!parkpro_invoice.is_subscribed(user), "User should not be subscribed");
    assert!(parkpro_invoice.get_subscription_end_date(user) == 0, "Subscription end date should be 0");
}

// Test error cases that should fail
#[test]
#[should_panic(expected: ('File name cannot be empty',))]
fn test_save_file_empty_filename() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let user: ContractAddress = contract_address_const::<'user'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // User tries to save file with empty filename (should fail)
    start_cheat_caller_address(parkpro_invoice.contract_address, user);
    parkpro_invoice.save_file("", "QmTestHash123");
    stop_cheat_caller_address(parkpro_invoice.contract_address);
}

#[test]
#[should_panic(expected: ('IPFS CID cannot be empty',))]
fn test_save_file_empty_ipfs_cid() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let user: ContractAddress = contract_address_const::<'user'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // User tries to save file with empty IPFS CID (should fail)
    start_cheat_caller_address(parkpro_invoice.contract_address, user);
    parkpro_invoice.save_file("test_file.pdf", "");
    stop_cheat_caller_address(parkpro_invoice.contract_address);
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_withdraw_tokens_unauthorized() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let user: ContractAddress = contract_address_const::<'user'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // User tries to withdraw tokens (should fail - not owner)
    start_cheat_caller_address(parkpro_invoice.contract_address, user);
    parkpro_invoice.withdraw_tokens(1000000000000000000);
    stop_cheat_caller_address(parkpro_invoice.contract_address);
}

#[test]
fn test_contract_deployment() {
    // Mock addresses for testing
    let owner: ContractAddress = contract_address_const::<'owner'>();
    let mock_token: ContractAddress = contract_address_const::<'mock_token'>();
    
    // Deploy ParkProInvoice contract
    let parkpro_invoice_class = declare("ParkProInvoiceContract").unwrap().contract_class();
    let (parkpro_invoice_address, _) = parkpro_invoice_class.deploy(@array![mock_token.into(), owner.into()]).unwrap();
    let parkpro_invoice = IParkProInvoiceContractDispatcher { contract_address: parkpro_invoice_address };
    
    // Test that the contract was deployed successfully
    assert!(parkpro_invoice.contract_address != contract_address_const::<0>(), "Contract should be deployed");
}
