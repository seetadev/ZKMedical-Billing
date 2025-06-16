#[starknet::contract]
mod MedToken {
    
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;

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

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    #[constructor]
   fn constructor(
    ref self: ContractState,
    initial_tokens: felt252,
    recipient: ContractAddress
) {
    let name: ByteArray = "Meditoken";
    let symbol: ByteArray = "MED";        
    let initial_supply: u256 = initial_tokens.into() * DECIMAL_MULTIPLIER;
        
        self.erc20.initializer(name, symbol);
        self.erc20.mint(recipient, initial_supply);
    }
}