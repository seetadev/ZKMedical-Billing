// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Testnet only — never deploy to mainnet
contract MockPPT is ERC20 {
    constructor(string memory name, string memory symbol, uint256 supply)
        ERC20(name, symbol)
    {
        _mint(msg.sender, supply);
    }

    // Faucet function for testnet development
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
