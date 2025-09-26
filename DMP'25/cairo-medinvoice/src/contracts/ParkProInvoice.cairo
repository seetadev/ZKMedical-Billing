#[starknet::contract]
mod ParkProInvoiceContract {
    use crate::interfaces::IParkProInvoice::{IParkProInvoiceContract, FileRecord, SubscriptionPlan};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map};

    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
    use starknet::storage::StorageMapReadAccess;
    use starknet::storage::StorageMapWriteAccess;

    const SUBSCRIPTION_AMOUNT: u256 = 10000000000000000000; // 10 tokens with 18 decimals (10 * 10^18)
    const SUBSCRIPTION_PERIOD: u64 = 365 * 24 * 60 * 60; // 365 days in seconds
    
    // Subscription plan constants
    const PLAN_1_COST: u256 = 1000000000000000000; // 1 token with 18 decimals
    const PLAN_2_COST: u256 = 10000000000000000000; // 10 tokens with 18 decimals  
    const PLAN_3_COST: u256 = 50000000000000000000; // 50 tokens with 18 decimals

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy, event: ReentrancyGuardEvent);
    
    
    // Component implementations
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        file_records: Map<(ContractAddress, u64), FileRecord>, // (user, file_id) -> FileRecord
        file_counter: Map<ContractAddress, u64>, 
        ppt_token_address: ContractAddress,
        subscription_end_times: Map<ContractAddress, u64>,
        // New storage for subscription plans
        subscription_plans: Map<u8, SubscriptionPlan>, // plan_id -> SubscriptionPlan
        user_files_allowed: Map<ContractAddress, u64>, // user -> files_allowed
        user_current_plan: Map<ContractAddress, u8>, // user -> plan_id
        user_plan_purchases: Map<(ContractAddress, u8), u64>, // (user, plan_id) -> purchase_count
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
        PlanSubscription: PlanSubscription,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat] ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct FileSaved {
        #[key]
        user: ContractAddress,
        file_id: u64,
        file_name: ByteArray,
        ipfs_cid: ByteArray,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct NewSubscription {
        #[key]
        subscriber: ContractAddress,
        end_time: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PlanSubscription {
        #[key]
        subscriber: ContractAddress,
        plan_id: u8,
        files_allowed: u64,
        cost: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, ppt_token: ContractAddress, initial_owner: ContractAddress) {
        self.ownable.initializer(initial_owner);
        self.ppt_token_address.write(ppt_token);
        
        // Initialize subscription plans
        let plan1 = SubscriptionPlan {
            plan_id: 1,
            cost: PLAN_1_COST,
            files_allowed: 5,
            plan_name: "Basic Plan"
        };
        
        let plan2 = SubscriptionPlan {
            plan_id: 2,
            cost: PLAN_2_COST,
            files_allowed: 50,
            plan_name: "Standard Plan"
        };
        
        let plan3 = SubscriptionPlan {
            plan_id: 3,
            cost: PLAN_3_COST,
            files_allowed: 250,
            plan_name: "Premium Plan"
        };
        
        self.subscription_plans.write(1, plan1);
        self.subscription_plans.write(2, plan2);
        self.subscription_plans.write(3, plan3);
    }

    #[abi(embed_v0)]
    impl ParkProInvoiceContractImpl of IParkProInvoiceContract<ContractState> {
       

       fn save_file(ref self: ContractState, file_name: ByteArray, ipfs_cid: ByteArray) {
            assert(file_name.len() > 0, 'File name cannot be empty');
            assert(ipfs_cid.len() > 0, 'IPFS CID cannot be empty');
            let caller = get_caller_address();
            let token_dispatcher = IERC20Dispatcher { contract_address: self.ppt_token_address.read() };
            let balance = token_dispatcher.balance_of(caller);
            assert(balance >= u256 { low: 1, high: 0 }, 'Not enough PPT Tokens');

            // Check file limits
            let current_file_count = self.file_counter.read(caller);
            let files_allowed = self.user_files_allowed.read(caller);
            assert(files_allowed > current_file_count, 'Purchase more file storage');

            let file_id = current_file_count + 1;
            let timestamp = get_block_timestamp();
            
            let file_record = FileRecord {
                file_name: file_name.clone(),
                ipfs_cid: ipfs_cid.clone(),
                timestamp: timestamp,
                owner: caller,
                exists: true,
            };
            
            self.file_records.write((caller, file_id), file_record);
            self.file_counter.write(caller, file_id);

            self.emit(FileSaved { 
                user: caller, 
                file_id: file_id,
                file_name: file_name,
                ipfs_cid: ipfs_cid,
                timestamp: timestamp
            });
        }

        fn get_files(self: @ContractState, user_address: ContractAddress) -> Array<FileRecord> {
            let mut files = ArrayTrait::new();
            let file_count = self.file_counter.read(user_address);
            // Add safety check
            assert(file_count <= 1000, 'Too many files'); // Prevent DoS
    
            let mut i: u64 = 1;
            let max_count = file_count + 1;
            while i != max_count {
                let file_record = self.file_records.read((user_address, i));
                if file_record.exists {
                    files.append(file_record);
                }
                i += 1;
            };
            
            files
        }

        fn get_user_tokens(self: @ContractState, user_address: ContractAddress) -> u256 {
            let token_dispatcher = IERC20Dispatcher { contract_address: self.ppt_token_address.read() };
            token_dispatcher.balance_of(user_address)
        }

        fn is_subscribed(self: @ContractState, user: ContractAddress) -> bool {
            self.subscription_end_times.read(user) > get_block_timestamp()
        }

        fn get_subscription_details(self: @ContractState, user_address: ContractAddress) -> (bool, u64) {
            let user_end_time = self.subscription_end_times.read(user_address);
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

            let token_dispatcher = IERC20Dispatcher { contract_address: self.ppt_token_address.read() };
            let balance = token_dispatcher.balance_of(caller);
            assert(balance >= SUBSCRIPTION_AMOUNT, 'Insufficient PPT tokens');
            // User must have approved this contract to spend SUBSCRIPTION_AMOUNT of their PPT tokens
            let contract_addr = get_contract_address();
            let success = token_dispatcher.transfer_from(caller, contract_addr, SUBSCRIPTION_AMOUNT);
            assert(success, 'PPT_TOKEN_TRANSFER_FAILED');

            let end_time = get_block_timestamp() + SUBSCRIPTION_PERIOD;
            self.subscription_end_times.write(caller, end_time);
            
            self.emit(NewSubscription { subscriber: caller, end_time: end_time });
            self.reentrancy.end();
        }

        fn withdraw_tokens(ref self: ContractState, amount: u256) {
                self.reentrancy.start();
                self.ownable.assert_only_owner();
                let owner_address = self.ownable.owner();
                let token_dispatcher = IERC20Dispatcher { contract_address: self.ppt_token_address.read() };
                
                // Check the contract's token balance
                let contract_balance = token_dispatcher.balance_of(get_contract_address());
                assert(contract_balance >= amount, 'Insufficient contract balance');
                
                // Transfer tokens from this contract to the owner
                let success = token_dispatcher.transfer(owner_address, amount);
                assert(success, 'PPT_TOKEN_TRANSFER_FAILED');
                self.reentrancy.end();
            }

        fn subscribe_to_plan(ref self: ContractState, plan_id: u8) {
            self.reentrancy.start();
            let caller = get_caller_address();
            
            // Get plan details
            let plan = self.subscription_plans.read(plan_id);
            assert(plan.plan_id != 0, 'Invalid plan ID');
            
            let token_dispatcher = IERC20Dispatcher { contract_address: self.ppt_token_address.read() };
            let balance = token_dispatcher.balance_of(caller);
            assert(balance >= plan.cost, 'Insufficient PPT tokens');
            
            // User must have approved this contract to spend the plan cost
            let contract_addr = get_contract_address();
            let success = token_dispatcher.transfer_from(caller, contract_addr, plan.cost);
            assert(success, 'PPT_TOKEN_TRANSFER_FAILED');
            
            // Add files to user's current allowance (cumulative)
            let current_files_allowed = self.user_files_allowed.read(caller);
            let new_files_allowed = current_files_allowed + plan.files_allowed;
            self.user_files_allowed.write(caller, new_files_allowed);
            self.user_current_plan.write(caller, plan_id);
            
            // Track plan purchases
            let current_purchases = self.user_plan_purchases.read((caller, plan_id));
            self.user_plan_purchases.write((caller, plan_id), current_purchases + 1);
            
            self.emit(PlanSubscription { 
                subscriber: caller, 
                plan_id: plan_id,
                files_allowed: new_files_allowed,
                cost: plan.cost
            });
            self.reentrancy.end();
        }

        fn get_subscription_plan(self: @ContractState, plan_id: u8) -> SubscriptionPlan {
            self.subscription_plans.read(plan_id)
        }

        fn get_user_file_limits(self: @ContractState, user: ContractAddress) -> (u64, u64) {
            let files_used = self.file_counter.read(user);
            let files_allowed = self.user_files_allowed.read(user);
            (files_used, files_allowed)
        }

        fn get_all_plans(self: @ContractState) -> Array<SubscriptionPlan> {
            let mut plans = ArrayTrait::new();
            plans.append(self.subscription_plans.read(1));
            plans.append(self.subscription_plans.read(2));
            plans.append(self.subscription_plans.read(3));
            plans
        }

        fn get_user_plan_purchases(self: @ContractState, user: ContractAddress, plan_id: u8) -> u64 {
            self.user_plan_purchases.read((user, plan_id))
        }

        fn get_user_subscription_summary(self: @ContractState, user: ContractAddress) -> (u64, u64, u8) {
            let files_used = self.file_counter.read(user);
            let files_allowed = self.user_files_allowed.read(user);
            let current_plan = self.user_current_plan.read(user);
            (files_used, files_allowed, current_plan)
        }
    }
}


