#[starknet::contract]
mod MedToken {
    
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::Map;
    use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20MetadataImpl = ERC20Component::ERC20MetadataImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl ERC20HooksImpl = ERC20HooksEmptyImpl<ContractState>;

    // Define constants
    const DECIMALS: u8 = 18;
    const DECIMAL_MULTIPLIER: u256 = 1000000000000000000; // 10^18
    const AIRDROP_AMOUNT: u256 = 25 * 1000000000000000000; // 25 PPT tokens
    const MAX_AIRDROP_RECIPIENTS: u32 = 20;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        airdrop_claimed: Map<ContractAddress, bool>,
        airdrop_count: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        AirdropClaimed: AirdropClaimed,
    }

    #[derive(Drop, starknet::Event)]
    struct AirdropClaimed {
        recipient: ContractAddress,
        amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        initial_tokens: felt252,
        recipient: ContractAddress
    ) {
        let name: ByteArray = "Park Pro Token";
        let symbol: ByteArray = "PPT";        
        let initial_supply: u256 = initial_tokens.into() * DECIMAL_MULTIPLIER;
        
        self.erc20.initializer(name, symbol);
        self.erc20.mint(recipient, initial_supply);
        self.airdrop_count.write(0);
    }

    #[external(v0)]
    fn claim_airdrop(ref self: ContractState) {
        let caller = get_caller_address();
        
        // Check if caller has already claimed
        assert(!self.airdrop_claimed.read(caller), 'Already claimed airdrop');
        
        // Check if airdrop limit reached
        let current_count = self.airdrop_count.read();
        assert(current_count < MAX_AIRDROP_RECIPIENTS, 'Airdrop limit reached');
        
        // Mark as claimed and increment counter
        self.airdrop_claimed.write(caller, true);
        self.airdrop_count.write(current_count + 1);
        
        // Mint tokens to caller
        self.erc20.mint(caller, AIRDROP_AMOUNT);
        
        // Emit event
        self.emit(AirdropClaimed { recipient: caller, amount: AIRDROP_AMOUNT });
    }

    #[external(v0)]
    fn has_claimed_airdrop(self: @ContractState, address: ContractAddress) -> bool {
        self.airdrop_claimed.read(address)
    }

    #[external(v0)]
    fn get_airdrop_count(self: @ContractState) -> u32 {
        self.airdrop_count.read()
    }

    #[external(v0)]
    fn get_remaining_airdrops(self: @ContractState) -> u32 {
        MAX_AIRDROP_RECIPIENTS - self.airdrop_count.read()
    }
}