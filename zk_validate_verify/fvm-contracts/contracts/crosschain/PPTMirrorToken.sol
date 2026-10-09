// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * PPTMirrorToken (deployed on Optimism)
 *
 * Wrapped representation of PPT on Optimism L2.
 * Only the relayer/bridge can mint and burn.
 * 1:1 backed by locked PPT on FVM.
 */
contract PPTMirrorToken is ERC20, Ownable {

    address public bridge;

    event BridgeMint(address indexed to, uint256 amount, bytes32 bridgeId);
    event BridgeBurn(address indexed from, uint256 amount);

    modifier onlyBridge() {
        require(msg.sender == bridge, "Mirror: not bridge");
        _;
    }

    constructor(address _bridge)
        ERC20("PPT Mirror Token", "mPPT")
        Ownable(msg.sender)
    {
        bridge = _bridge;
    }

    function bridgeMint(address to, uint256 amount, bytes32 bridgeId)
        external onlyBridge
    {
        _mint(to, amount);
        emit BridgeMint(to, amount, bridgeId);
    }

    function bridgeBurn(address from, uint256 amount) external onlyBridge {
        _burn(from, amount);
        emit BridgeBurn(from, amount);
    }

    function setBridge(address _bridge) external onlyOwner {
        bridge = _bridge;
    }
}
