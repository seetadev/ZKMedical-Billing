// Define the external interface trait
use starknet::{ContractAddress};

#[derive(Drop, Serde, starknet::Store)]
pub struct FileRecord {
    pub file_name: ByteArray,
    pub ipfs_cid: ByteArray,
    pub timestamp: u64,
    pub owner: ContractAddress,
    pub exists: bool,
}

#[starknet::interface]
pub trait IMedInvoiceContract<TContractState> {
    fn save_file(ref self: TContractState, file_name: ByteArray, ipfs_cid: ByteArray);
    fn get_files(self: @TContractState, user_address: ContractAddress) -> Array<FileRecord>;
    fn get_user_tokens(self: @TContractState, user_address: ContractAddress) -> u256;
    fn is_subscribed(self: @TContractState, user: ContractAddress) -> bool;
    fn get_subscription_details(self: @TContractState, user_address: ContractAddress) -> (bool, u64);
    fn get_subscription_end_date(self: @TContractState, user: ContractAddress) -> u64;
    fn subscribe(ref self: TContractState);
    fn withdraw_tokens(ref self: TContractState, amount: u256);
}