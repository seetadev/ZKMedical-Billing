// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Mock fraud verifier — always returns true with score 10 (safe) — unit tests only
contract MockFraudVerifier {
    function verifyProof(
        uint256[2]    calldata,
        uint256[2][2] calldata,
        uint256[2]    calldata,
        uint256[1]    calldata
    ) external pure returns (bool) {
        return true;
    }
}
