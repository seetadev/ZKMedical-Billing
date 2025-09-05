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

#[derive(Drop, Serde, starknet::Store)]
pub struct SubscriptionPlan {
    pub plan_id: u8,
    pub cost: u256,
    pub files_allowed: u64,
    pub plan_name: ByteArray,
}

#[starknet::interface]
pub trait IParkProInvoiceContract<TContractState> {
    fn save_file(ref self: TContractState, file_name: ByteArray, ipfs_cid: ByteArray);
    fn get_files(self: @TContractState, user_address: ContractAddress) -> Array<FileRecord>;
    fn get_user_tokens(self: @TContractState, user_address: ContractAddress) -> u256;
    fn is_subscribed(self: @TContractState, user: ContractAddress) -> bool;
    fn get_subscription_details(self: @TContractState, user_address: ContractAddress) -> (bool, u64);
    fn get_subscription_end_date(self: @TContractState, user: ContractAddress) -> u64;
    fn subscribe(ref self: TContractState);
    fn withdraw_tokens(ref self: TContractState, amount: u256);
    
    // New functions for subscription plans
    fn subscribe_to_plan(ref self: TContractState, plan_id: u8);
    fn get_subscription_plan(self: @TContractState, plan_id: u8) -> SubscriptionPlan;
    fn get_user_file_limits(self: @TContractState, user: ContractAddress) -> (u64, u64); // (files_used, files_allowed)
    fn get_all_plans(self: @TContractState) -> Array<SubscriptionPlan>;
    fn get_user_plan_purchases(self: @TContractState, user: ContractAddress, plan_id: u8) -> u64; // How many times user bought this plan
    fn get_user_subscription_summary(self: @TContractState, user: ContractAddress) -> (u64, u64, u8); // (files_used, files_allowed, current_plan_id)
}