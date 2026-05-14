// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UserSide} from "../src/UserSide.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Minimal mock MediToken for testing
contract MockMediToken is ERC20 {
    constructor() ERC20("MediToken", "MEDT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract UserSideTest is Test {
    UserSide public userSide;
    MockMediToken public mediToken;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);

    function setUp() public {
        vm.startPrank(owner);
        mediToken = new MockMediToken();
        userSide = new UserSide(address(mediToken));
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────
    // createUser — token gate
    // ─────────────────────────────────────────────

    function test_createUser_revertsIfNoMediTokenBalance() public {
        vm.prank(alice);
        vm.expectRevert("You need to hold atleast 1 MediTokens to register");
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
    }

    function test_createUser_patientRegistersSuccessfully() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        assertEq(userId, 1);
    }

    function test_createUser_totalUsersIncrements() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        assertEq(userSide.totalUsers(), 2);
    }

    function test_createUser_emailMappingSetForPatient() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userEmailtoUserId("alice@example.com");
        assertEq(userId, 1);
    }

    function test_createUser_patientIsVerifiedImmediately() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        (,,,,,,,,,, , bool isVerified) = userSide.userIdtoUser(userId);
        assertTrue(isVerified);
    }

    function test_createUser_nonPatientRoleRegisters() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Dr. Alice", "1234 5678 9012", "LIC001", 35,
            "dr.alice@example.com", "Cardiology", "ipfs://img", "ipfs://deg", 2
        );
        // Doctor is not verified until approveUser is called
        // totalUsers should still increment
        assertEq(userSide.totalUsers(), 2);
    }

    // ─────────────────────────────────────────────
    // Duplicate wallet / email check (PR 2 fix)
    // ─────────────────────────────────────────────

    function test_createUser_revertsOnDuplicateWalletForPatient() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        vm.prank(alice);
        vm.expectRevert("User with this wallet address or email already exists");
        userSide.createUser(
            "Alice2", "9999 9999 9999", "LIC002", 26,
            "alice2@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
    }

    function test_createUser_revertsOnDuplicateEmailForPatient() public {
        mediToken.mint(alice, 10);
        mediToken.mint(bob, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "shared@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        vm.prank(bob);
        vm.expectRevert("User with this wallet address or email already exists");
        userSide.createUser(
            "Bob", "9999 9999 9999", "LIC002", 30,
            "shared@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
    }

    // ─────────────────────────────────────────────
    // approveUser
    // ─────────────────────────────────────────────

    function test_approveUser_onlyOwnerCanApprove() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Dr. Alice", "1234 5678 9012", "LIC001", 35,
            "dr.alice@example.com", "Cardiology", "ipfs://img", "ipfs://deg", 2
        );
        vm.prank(bob);
        vm.expectRevert();
        userSide.approveUser(1);
    }

    function test_approveUser_setsVerifiedAndMappings() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Dr. Alice", "1234 5678 9012", "LIC001", 35,
            "dr.alice@example.com", "Cardiology", "ipfs://img", "ipfs://deg", 2
        );
        vm.prank(owner);
        userSide.approveUser(1);
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        assertEq(userId, 1);
        (,,,,,,,,,, , bool isVerified) = userSide.userIdtoUser(1);
        assertTrue(isVerified);
    }

    // ─────────────────────────────────────────────
    // disApproveUser
    // ─────────────────────────────────────────────

    function test_disApproveUser_blacklistsUser() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        vm.prank(owner);
        userSide.disApproveUser(userId);
        assertTrue(userSide.userIdtoBlacklist(userId));
        (,,,,,,,,,, , bool isVerified) = userSide.userIdtoUser(userId);
        assertFalse(isVerified);
    }

    function test_disApproveUser_onlyOwner() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        vm.prank(bob);
        vm.expectRevert();
        userSide.disApproveUser(1);
    }

    // ─────────────────────────────────────────────
    // reportUser
    // ─────────────────────────────────────────────

    function test_reportUser_incrementsReportCount() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        userSide.reportUser(userId);
        assertEq(userSide.userIdtoReportUser(userId), 1);
    }

    function test_reportUser_blacklistsAfter100Reports() public {
        mediToken.mint(alice, 10);
        vm.prank(alice);
        userSide.createUser(
            "Alice", "1234 5678 9012", "LIC001", 25,
            "alice@example.com", "General", "ipfs://img", "ipfs://deg", 3
        );
        uint256 userId = userSide.userWalletAddresstoUserId(alice);
        for (uint256 i = 0; i <= 100; i++) {
            userSide.reportUser(userId);
        }
        assertTrue(userSide.userIdtoBlacklist(userId));
    }

    // ─────────────────────────────────────────────
    // getUserTokens
    // ─────────────────────────────────────────────

    function test_getUserTokens_returnsCorrectBalance() public {
        mediToken.mint(alice, 42);
        vm.prank(alice);
        uint256 bal = userSide.getUserTokens();
        assertEq(bal, 42);
    }
}
