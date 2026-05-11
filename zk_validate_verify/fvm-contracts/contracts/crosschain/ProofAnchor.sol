// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ProofAnchor (deployed on Optimism)
 *
 * Mirrors verified invoice commitments from Filecoin FVM.
 * Insurers on Optimism call isAnchored() to verify a claim at OP gas prices
 * (~$0.001) without touching FVM. The actual proof stays on FVM.
 *
 * Only the relayer can anchor commitments after verifying the FVM event.
 */
contract ProofAnchor is Ownable {

    address public relayer;

    struct AnchoredProof {
        bytes32 commitment;
        address provider;
        string  ipfsCID;
        uint256 anchoredAt;    // timestamp on Optimism
        uint256 fvmTimestamp;  // original timestamp on FVM
    }

    mapping(bytes32 => AnchoredProof) public anchors;
    bytes32[] public allCommitments;

    event ProofAnchored(
        bytes32 indexed commitment,
        address indexed provider,
        string  ipfsCID,
        uint256 fvmTimestamp
    );

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Anchor: not relayer");
        _;
    }

    constructor(address _relayer) Ownable(msg.sender) {
        relayer = _relayer;
    }

    function anchorProof(
        bytes32 commitment,
        address provider,
        string calldata ipfsCID,
        uint256 fvmTimestamp
    ) external onlyRelayer {
        require(anchors[commitment].anchoredAt == 0, "Anchor: already anchored");

        anchors[commitment] = AnchoredProof({
            commitment:   commitment,
            provider:     provider,
            ipfsCID:      ipfsCID,
            anchoredAt:   block.timestamp,
            fvmTimestamp: fvmTimestamp
        });

        allCommitments.push(commitment);
        emit ProofAnchored(commitment, provider, ipfsCID, fvmTimestamp);
    }

    function isAnchored(bytes32 commitment) external view returns (bool) {
        return anchors[commitment].anchoredAt > 0;
    }

    function getAnchor(bytes32 commitment)
        external view returns (AnchoredProof memory)
    {
        return anchors[commitment];
    }

    function totalAnchored() external view returns (uint256) {
        return allCommitments.length;
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }
}
