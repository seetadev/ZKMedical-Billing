// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Placeholder — replace with the Solidity verifier exported by Sindri after ZKML circuit compilation.
// Generated via: sindriService.uploadAndCompileCircuit() → exports FraudVerifier.sol
contract FraudVerifier {
    function verifyProof(
        uint256[2]    calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2]    calldata _pC,
        uint256[1]    calldata _pubSignals
    ) public view returns (bool) {
        // Placeholder always returns false — real Sindri verifier checks the ZKML proof
        return false;
    }
}
