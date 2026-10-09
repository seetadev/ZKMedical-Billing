// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FraudVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * FraudRegistry
 *
 * Wraps the Sindri-generated FraudVerifier.
 * MedicalBillingRegistry calls checkFraudProof() before
 * accepting any invoice submission.
 *
 * Suspicious invoices are blocked and logged for manual review.
 */
contract FraudRegistry is Ownable {

    FraudVerifier public immutable verifier;

    uint256 public fraudThreshold = 75;   // 0–100, flag above this

    struct FraudCheck {
        uint256 fraudScore;
        bool    isSafe;
        uint256 checkedAt;
    }

    mapping(bytes32 => FraudCheck) public checks;
    mapping(bytes32 => bool)       public flagged;

    event FraudCheckPassed(bytes32 indexed commitment, uint256 score);
    event FraudCheckFailed(bytes32 indexed commitment, uint256 score);

    constructor(address _verifier) Ownable(msg.sender) {
        verifier = FraudVerifier(_verifier);
    }

    /**
     * Verify a Sindri fraud proof and record the result.
     * Called by MedicalBillingRegistry.submitInvoice() before storing.
     *
     * @param pA pB pC      Groth16 proof from Sindri
     * @param pubSignals    [fraud_score] as public output
     * @param commitment    invoice commitment being checked
     */
    function checkFraudProof(
        uint256[2]    calldata pA,
        uint256[2][2] calldata pB,
        uint256[2]    calldata pC,
        uint256[1]    calldata pubSignals,
        bytes32       commitment
    ) external returns (bool isSafe) {

        bool validProof = verifier.verifyProof(pA, pB, pC, pubSignals);
        require(validProof, "FraudRegistry: invalid proof");

        uint256 fraudScore = pubSignals[0];
        isSafe = fraudScore < fraudThreshold;

        checks[commitment] = FraudCheck({
            fraudScore: fraudScore,
            isSafe:     isSafe,
            checkedAt:  block.timestamp
        });

        if (isSafe) {
            emit FraudCheckPassed(commitment, fraudScore);
        } else {
            flagged[commitment] = true;
            emit FraudCheckFailed(commitment, fraudScore);
        }
    }

    function isFlagged(bytes32 commitment) external view returns (bool) {
        return flagged[commitment];
    }

    function getCheck(bytes32 commitment)
        external view returns (FraudCheck memory)
    {
        return checks[commitment];
    }

    function setThreshold(uint256 threshold) external onlyOwner {
        require(threshold <= 100, "FraudRegistry: threshold must be 0-100");
        fraudThreshold = threshold;
    }
}
