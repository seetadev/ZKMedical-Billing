// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * BillingBridge (deployed on Filecoin FVM)
 *
 * Handles two cross-chain operations:
 *  1. Token bridge: lock PPT on FVM → relayer mints mirror on Optimism
 *  2. Proof anchor: emit commitment event → relayer anchors on Optimism
 *
 * The relayer watches BridgeInitiated and ProofBridged events.
 */
contract BillingBridge is Ownable, ReentrancyGuard {

    IERC20 public immutable pptToken;

    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool)    public bridgedCommitments;

    address public relayer;

    event BridgeInitiated(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 nonce,
        bytes32 bridgeId
    );

    event ProofBridged(
        bytes32 indexed commitment,
        address indexed provider,
        string  ipfsCID,
        uint256 timestamp
    );

    event BridgeCompleted(bytes32 indexed bridgeId);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Bridge: not relayer");
        _;
    }

    constructor(address _pptToken, address _relayer) Ownable(msg.sender) {
        pptToken = IERC20(_pptToken);
        relayer  = _relayer;
    }

    /**
     * Lock PPT on FVM to bridge to Optimism.
     * Relayer watches the event and mints mirror tokens on the OP side.
     */
    function bridgeTokens(uint256 amount, address recipient)
        external nonReentrant returns (bytes32 bridgeId)
    {
        require(amount > 0,              "Bridge: amount must be > 0");
        require(recipient != address(0), "Bridge: invalid recipient");

        require(
            pptToken.transferFrom(msg.sender, address(this), amount),
            "Bridge: transfer failed"
        );

        uint256 nonce = nonces[msg.sender]++;
        bridgeId = keccak256(abi.encodePacked(
            msg.sender, recipient, amount, nonce, block.chainid
        ));

        emit BridgeInitiated(msg.sender, recipient, amount, nonce, bridgeId);
    }

    /**
     * Bridge a verified invoice commitment to Optimism.
     * Call after registry.submitInvoice() succeeds on FVM.
     */
    function bridgeProof(bytes32 commitment, string calldata ipfsCID)
        external nonReentrant
    {
        require(!bridgedCommitments[commitment], "Bridge: already bridged");
        bridgedCommitments[commitment] = true;

        emit ProofBridged(commitment, msg.sender, ipfsCID, block.timestamp);
    }

    function confirmBridge(bytes32 bridgeId) external onlyRelayer {
        emit BridgeCompleted(bridgeId);
    }

    function emergencyUnlock(address to, uint256 amount) external onlyOwner {
        pptToken.transfer(to, amount);
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function lockedBalance() external view returns (uint256) {
        return pptToken.balanceOf(address(this));
    }
}
