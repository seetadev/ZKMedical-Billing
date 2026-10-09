// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Mock verifier that always returns true — for unit tests only, never deploy to mainnet
contract MockVerifier {
    function verifyProof(
        uint256[2]    calldata,
        uint256[2][2] calldata,
        uint256[2]    calldata,
        uint256[2]    calldata
    ) external pure returns (bool) {
        return true;
    }
}
