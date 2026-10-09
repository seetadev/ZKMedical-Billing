// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/UserSide.sol";
import "../src/DoctorSide.sol";

/**
 * NullifierRegistry Tests
 *
 * Tests for the nullifier-based replay-attack prevention layer.
 * These complement adarsh-7-satyam's UserSide/DoctorSide tests (PR #83)
 * by focusing on the ZK proof submission and nullifier registry logic
 * that prevents the same invoice from being verified more than once.
 *
 * The nullifier is computed off-chain as Poseidon(patientId, providerId, nonce)
 * and submitted alongside the ZK proof. The registry stores used nullifiers
 * and rejects any resubmission.
 */

/// @dev Minimal nullifier registry — mirrors what MedInvoiceContract.sol
///      will implement once the ZK verifier is wired in.
contract NullifierRegistry {
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(bytes32 => address) public nullifierToSubmitter;
    mapping(bytes32 => uint256) public nullifierToTimestamp;

    event InvoiceVerified(bytes32 indexed nullifier, address indexed submitter, uint256 claimedTotal);
    event ReplayAttempt(bytes32 indexed nullifier, address indexed attacker);

    error NullifierAlreadyUsed(bytes32 nullifier);
    error InvalidClaimedTotal();
    error ZeroNullifier();

    /// @notice Submit a verified invoice proof.
    ///         In production this would also verify the ZK proof on-chain.
    ///         Here we test the nullifier logic in isolation.
    function submitVerifiedInvoice(
        bytes32 nullifier,
        uint256 claimedTotal
    ) external {
        if (nullifier == bytes32(0)) revert ZeroNullifier();
        if (claimedTotal == 0) revert InvalidClaimedTotal();
        if (usedNullifiers[nullifier]) revert NullifierAlreadyUsed(nullifier);

        usedNullifiers[nullifier] = true;
        nullifierToSubmitter[nullifier] = msg.sender;
        nullifierToTimestamp[nullifier] = block.timestamp;

        emit InvoiceVerified(nullifier, msg.sender, claimedTotal);
    }

    /// @notice Check if a nullifier has been used without reverting.
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return usedNullifiers[nullifier];
    }
}

contract NullifierRegistryTest is Test {
    NullifierRegistry public registry;

    address public hospital = makeAddr("hospital");
    address public fraudster = makeAddr("fraudster");

    // Sample nullifiers (would be Poseidon hashes in production)
    bytes32 constant NULLIFIER_A = keccak256("patientId=1,providerId=42,nonce=100");
    bytes32 constant NULLIFIER_B = keccak256("patientId=2,providerId=42,nonce=101");
    bytes32 constant NULLIFIER_C = keccak256("patientId=1,providerId=42,nonce=102");

    function setUp() public {
        registry = new NullifierRegistry();
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    function test_SubmitInvoice_StoresNullifier() public {
        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        assertTrue(registry.isNullifierUsed(NULLIFIER_A));
        assertEq(registry.nullifierToSubmitter(NULLIFIER_A), hospital);
    }

    function test_SubmitInvoice_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit NullifierRegistry.InvoiceVerified(NULLIFIER_A, hospital, 50000);

        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);
    }

    function test_DifferentNullifiers_BothAccepted() public {
        vm.startPrank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);
        registry.submitVerifiedInvoice(NULLIFIER_B, 75000);
        vm.stopPrank();

        assertTrue(registry.isNullifierUsed(NULLIFIER_A));
        assertTrue(registry.isNullifierUsed(NULLIFIER_B));
    }

    function test_SamePatientDifferentNonce_Accepted() public {
        // Same patient and provider, different nonce = different invoice = allowed
        vm.startPrank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);
        registry.submitVerifiedInvoice(NULLIFIER_C, 30000); // same patient, new nonce
        vm.stopPrank();

        assertTrue(registry.isNullifierUsed(NULLIFIER_A));
        assertTrue(registry.isNullifierUsed(NULLIFIER_C));
    }

    function test_UnusedNullifier_ReturnsFalse() public view {
        assertFalse(registry.isNullifierUsed(NULLIFIER_A));
    }

    // ── Replay attack prevention ──────────────────────────────────────────────

    function test_ReplayAttack_SameSubmitter_Reverts() public {
        vm.startPrank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        // Hospital tries to claim the same invoice again
        vm.expectRevert(
            abi.encodeWithSelector(NullifierRegistry.NullifierAlreadyUsed.selector, NULLIFIER_A)
        );
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);
        vm.stopPrank();
    }

    function test_ReplayAttack_DifferentSubmitter_Reverts() public {
        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        // Fraudster tries to submit the same invoice from a different address
        vm.expectRevert(
            abi.encodeWithSelector(NullifierRegistry.NullifierAlreadyUsed.selector, NULLIFIER_A)
        );
        vm.prank(fraudster);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);
    }

    function test_ReplayAttack_DifferentClaimedTotal_StillReverts() public {
        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        // Attacker tries same nullifier but inflated amount — still blocked
        vm.expectRevert(
            abi.encodeWithSelector(NullifierRegistry.NullifierAlreadyUsed.selector, NULLIFIER_A)
        );
        vm.prank(fraudster);
        registry.submitVerifiedInvoice(NULLIFIER_A, 999999);
    }

    // ── Input validation ──────────────────────────────────────────────────────

    function test_ZeroNullifier_Reverts() public {
        vm.prank(hospital);
        vm.expectRevert(NullifierRegistry.ZeroNullifier.selector);
        registry.submitVerifiedInvoice(bytes32(0), 50000);
    }

    function test_ZeroClaimedTotal_Reverts() public {
        vm.prank(hospital);
        vm.expectRevert(NullifierRegistry.InvalidClaimedTotal.selector);
        registry.submitVerifiedInvoice(NULLIFIER_A, 0);
    }

    // ── Timestamp and submitter tracking ─────────────────────────────────────

    function test_NullifierTimestamp_RecordedCorrectly() public {
        uint256 submitTime = 1_700_000_000;
        vm.warp(submitTime);

        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        assertEq(registry.nullifierToTimestamp(NULLIFIER_A), submitTime);
    }

    function test_NullifierSubmitter_RecordedCorrectly() public {
        vm.prank(hospital);
        registry.submitVerifiedInvoice(NULLIFIER_A, 50000);

        assertEq(registry.nullifierToSubmitter(NULLIFIER_A), hospital);
    }

    // ── Fuzz tests ────────────────────────────────────────────────────────────

    function testFuzz_UniqueNullifiers_AllAccepted(bytes32 n1, bytes32 n2) public {
        vm.assume(n1 != n2);
        vm.assume(n1 != bytes32(0));
        vm.assume(n2 != bytes32(0));

        vm.startPrank(hospital);
        registry.submitVerifiedInvoice(n1, 10000);
        registry.submitVerifiedInvoice(n2, 20000);
        vm.stopPrank();

        assertTrue(registry.isNullifierUsed(n1));
        assertTrue(registry.isNullifierUsed(n2));
    }

    function testFuzz_ReplayAlwaysReverts(bytes32 nullifier, uint256 amount) public {
        vm.assume(nullifier != bytes32(0));
        vm.assume(amount > 0 && amount < type(uint128).max);

        vm.startPrank(hospital);
        registry.submitVerifiedInvoice(nullifier, amount);

        vm.expectRevert(
            abi.encodeWithSelector(NullifierRegistry.NullifierAlreadyUsed.selector, nullifier)
        );
        registry.submitVerifiedInvoice(nullifier, amount);
        vm.stopPrank();
    }
}
