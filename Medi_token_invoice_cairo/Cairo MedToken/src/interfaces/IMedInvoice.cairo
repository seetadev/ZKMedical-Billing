// Define the external interface trait
    use starknet::{ContractAddress};
    #[starknet::interface]
    pub trait IMedInvoiceContract<TContractState> {
            fn save_file(ref self: TContractState, file: ByteArray);
            fn get_files(self: @TContractState) -> Array<ByteArray>;
            fn get_user_tokens(self: @TContractState) -> u256;
            fn is_subscribed(self: @TContractState, user: ContractAddress) -> bool;
            fn get_subscription_details(self: @TContractState) -> (bool, u64);
            fn get_subscription_end_date(self: @TContractState, user: ContractAddress) -> u64;
            fn subscribe(ref self: TContractState);
            fn withdraw_tokens(ref self: TContractState, amount: u256);
        }