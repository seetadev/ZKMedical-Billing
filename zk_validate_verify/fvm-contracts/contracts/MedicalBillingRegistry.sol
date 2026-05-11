// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./MedicalInvoiceVerifier.sol";
import "./PPTPaymentController.sol";
import "./FraudRegistry.sol";

/**
 * MedicalBillingRegistry
 *
 * Orchestrates the full ZK billing workflow:
 *  1. Collect PPT fee (via PaymentController)
 *  2. Verify ZK proof on-chain (via MedicalInvoiceVerifier)
 *  3. Store commitment + IPFS CID immutably
 *  4. Emit event for indexing (The Graph / EMTTR pipeline)
 *
 * No private patient data is stored on-chain.
 * Only Poseidon commitment + IPFS CID link to encrypted off-chain data.
 */
contract MedicalBillingRegistry is Ownable, ReentrancyGuard, Pausable {

    MedicalInvoiceVerifier public immutable verifier;
    PPTPaymentController   public immutable paymentController;
    FraudRegistry          public immutable fraudRegistry;

    struct InvoiceRecord {
        bytes32 commitment;    // Poseidon(patient_id, amount, service_code, ...)
        uint256 coverageLimit; // public input used during proof generation
        address provider;      // msg.sender — the submitting hospital/clinic
        uint256 submittedAt;   // block.timestamp
        string  ipfsCID;       // Lighthouse/Storacha CID of encrypted invoice
        bool    disputed;      // insurer can flag for review
    }

    // commitment → record
    mapping(bytes32 => InvoiceRecord) public invoices;

    // provider address → all their commitment hashes
    mapping(address => bytes32[]) public providerInvoices;

    // insurer → commitment → access granted
    mapping(address => mapping(bytes32 => bool)) public insurerAccess;

    uint256 public totalInvoices;

    event InvoiceSubmitted(
        bytes32 indexed commitment,
        address indexed provider,
        string  ipfsCID,
        uint256 coverageLimit,
        uint256 timestamp
    );
    event InvoiceDisputed(bytes32 indexed commitment, address indexed insurer);
    event InsurerAccessGranted(bytes32 indexed commitment, address indexed insurer);

    constructor(
        address _verifier,
        address _paymentController,
        address _fraudRegistry
    ) Ownable(msg.sender) {
        verifier          = MedicalInvoiceVerifier(_verifier);
        paymentController = PPTPaymentController(_paymentController);
        fraudRegistry     = FraudRegistry(_fraudRegistry);
    }

    /**
     * submitInvoice — main entry point.
     * Called by hospitals after generating a ZK proof off-chain via generate_proof.js.
     *
     * @param pA, pB, pC   Groth16 proof components from snarkjs
     * @param pubSignals    [invoice_commitment, is_valid]
     * @param coverageLimit the coverage limit used as public circuit input
     * @param ipfsCID       CID of encrypted invoice stored on Filecoin
     */
    function submitInvoice(
        uint256[2]    calldata pA,
        uint256[2][2] calldata pB,
        uint256[2]    calldata pC,
        uint256[2]    calldata pubSignals,
        uint256       coverageLimit,
        string        calldata ipfsCID,
        // Fraud proof from Sindri (appended to every submission)
        uint256[2]    calldata fpA,
        uint256[2][2] calldata fpB,
        uint256[2]    calldata fpC,
        uint256[1]    calldata fraudPubSignals
    ) external nonReentrant whenNotPaused {

        require(pubSignals[1] == 1,  "Registry: invoice constraints not satisfied");
        bytes32 commitment = bytes32(pubSignals[0]);
        require(invoices[commitment].submittedAt == 0, "Registry: duplicate invoice");
        require(bytes(ipfsCID).length > 0,             "Registry: IPFS CID required");

        // 1. Fraud check FIRST — reject suspicious invoices before spending gas
        bool isSafe = fraudRegistry.checkFraudProof(fpA, fpB, fpC, fraudPubSignals, commitment);
        require(isSafe, "Registry: invoice flagged as suspicious by fraud model");

        // 2. Collect PPT fee (reverts if insufficient balance/allowance)
        paymentController.collectInvoiceFee(msg.sender);

        // 3. Verify ZK proof on-chain
        bool valid = verifier.verifyProof(pA, pB, pC, pubSignals);
        require(valid, "Registry: invalid ZK proof");

        // 3. Store record — only commitment and CID, never raw patient data
        invoices[commitment] = InvoiceRecord({
            commitment:    commitment,
            coverageLimit: coverageLimit,
            provider:      msg.sender,
            submittedAt:   block.timestamp,
            ipfsCID:       ipfsCID,
            disputed:      false
        });

        providerInvoices[msg.sender].push(commitment);
        totalInvoices++;

        emit InvoiceSubmitted(commitment, msg.sender, ipfsCID, coverageLimit, block.timestamp);
    }

    // ── Insurer access control ──

    function grantInsurerAccess(bytes32 commitment, address insurer) external {
        require(invoices[commitment].provider == msg.sender, "Registry: not your invoice");
        insurerAccess[insurer][commitment] = true;
        emit InsurerAccessGranted(commitment, insurer);
    }

    function disputeInvoice(bytes32 commitment) external {
        require(insurerAccess[msg.sender][commitment], "Registry: no access");
        require(invoices[commitment].submittedAt > 0,  "Registry: invoice not found");
        invoices[commitment].disputed = true;
        emit InvoiceDisputed(commitment, msg.sender);
    }

    // ── Read functions ──

    function isVerified(bytes32 commitment) external view returns (bool) {
        return invoices[commitment].submittedAt > 0 && !invoices[commitment].disputed;
    }

    function getProviderInvoices(address provider) external view returns (bytes32[] memory) {
        return providerInvoices[provider];
    }

    function getInvoiceCount(address provider) external view returns (uint256) {
        return providerInvoices[provider].length;
    }

    // ── Emergency admin ──

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
