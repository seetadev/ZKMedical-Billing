#[starknet::contract]
mod MedInvoiceContract {
    use crate::interfaces::IMedInvoice::IMedInvoiceContract; // <-- Add this line
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map};

    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
    use starknet::storage::StorageMapReadAccess;
    use starknet::storage::StorageMapWriteAccess;

    const SUBSCRIPTION_AMOUNT: u256 = 10000000000000000000; // 10 tokens with 18 decimals (10 * 10^18)
    const SUBSCRIPTION_PERIOD: u64 = 365 * 24 * 60 * 60; // 365 days in seconds

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy, event: ReentrancyGuardEvent);
    
    
    // Component implementations
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        file_list: Map<(ContractAddress, u64), ByteArray>, // (user, file_id) -> content
        file_counter: Map<ContractAddress, u64>, 
        medi_token_address: ContractAddress,
        subscription_end_times: Map<ContractAddress, u64>,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        reentrancy: ReentrancyGuardComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        FileSaved: FileSaved,
        NewSubscription: NewSubscription,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat] ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct FileSaved {
        #[key]
        user: ContractAddress,
        file: u64,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct NewSubscription {
        #[key]
        subscriber: ContractAddress,
        end_time: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, medi_token: ContractAddress, initial_owner: ContractAddress) {
        self.ownable.initializer(initial_owner);
        self.medi_token_address.write(medi_token);
    }

    #[abi(embed_v0)]
    impl MedInvoiceContractImpl of IMedInvoiceContract<ContractState> {
       

       fn save_file(ref self: ContractState, file: ByteArray) {
            assert(file.len()>0, 'File content cannot be empty');
            let caller = get_caller_address();
            let token_dispatcher = IERC20Dispatcher { contract_address: self.medi_token_address.read() };
            let balance = token_dispatcher.balance_of(caller);
            assert(balance >= u256 { low: 1, high: 0 }, 'Not enough Med Tokens');

            let file_id = self.file_counter.read(caller) + 1;
            self.file_list.write((caller, file_id), file);
            self.file_counter.write(caller, file_id);

            self.emit(FileSaved { 
                user: caller, 
                file: file_id,
                timestamp: get_block_timestamp() 
            });
        }

        fn get_files(self: @ContractState) -> Array<ByteArray> {
            let caller = get_caller_address();
            
            let mut files = ArrayTrait::new();
            let file_count = self.file_counter.read(caller);
            // Add safety check
            assert(file_count <= 1000, 'Too many files'); // Prevent DoS
    
            let mut i: u64 = 1;
            let max_count = file_count + 1;
            while i != max_count {
                let file_content = self.file_list.read((caller, i));
                files.append(file_content);
                i += 1;
            };
            
            files
        }

        fn get_user_tokens(self: @ContractState) -> u256 {
            let caller = get_caller_address();
            let token_dispatcher = IERC20Dispatcher { contract_address: self.medi_token_address.read() };
            token_dispatcher.balance_of(caller)
        }

        fn is_subscribed(self: @ContractState, user: ContractAddress) -> bool {
            self.subscription_end_times.read(user) > get_block_timestamp()
        }

        fn get_subscription_details(self: @ContractState) -> (bool, u64) {
            let caller = get_caller_address();
            let user_end_time = self.subscription_end_times.read(caller);
            let exists = user_end_time > 0;
            (exists, user_end_time)
        }

        fn get_subscription_end_date(self: @ContractState, user: ContractAddress) -> u64 {
            self.subscription_end_times.read(user)
        }

        fn subscribe(ref self: ContractState) {
            self.reentrancy.start();
            let caller = get_caller_address();
            assert(!self.is_subscribed(caller), 'ALREADY_SUBSCRIBED');

            let token_dispatcher = IERC20Dispatcher { contract_address: self.medi_token_address.read() };
            let balance = token_dispatcher.balance_of(caller);
            assert(balance >= SUBSCRIPTION_AMOUNT, 'Insufficient Med tokens');
            // User must have approved this contract to spend SUBSCRIPTION_AMOUNT of their Medi tokens
            let contract_addr = get_contract_address();
            let success = token_dispatcher.transfer_from(caller, contract_addr, SUBSCRIPTION_AMOUNT);
            assert(success, 'MEDI_TOKEN_TRANSFER_FAILED');

            let end_time = get_block_timestamp() + SUBSCRIPTION_PERIOD;
            self.subscription_end_times.write(caller, end_time);
            
            self.emit(NewSubscription { subscriber: caller, end_time: end_time });
            self.reentrancy.end();
        }

        fn withdraw_tokens(ref self: ContractState, amount: u256) {
                self.reentrancy.start();
                self.ownable.assert_only_owner();
                let owner_address = self.ownable.owner();
                let token_dispatcher = IERC20Dispatcher { contract_address: self.medi_token_address.read() };
                
                // Check the contract's token balance
                let contract_balance = token_dispatcher.balance_of(get_contract_address());
                assert(contract_balance >= amount, 'Insufficient contract balance');
                
                // Transfer tokens from this contract to the owner
                let success = token_dispatcher.transfer(owner_address, amount);
                assert(success, 'MEDI_TOKEN_TRANSFER_FAILED');
                self.reentrancy.end();
            }
    }
}