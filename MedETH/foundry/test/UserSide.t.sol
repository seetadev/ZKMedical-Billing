// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UserSide} from "../src/UserSide.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockMediToken is ERC20 {
    constructor() ERC20("MediToken", "MEDI") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract UserSideTest is Test {
    UserSide public userSide;
    MockMediToken public mediToken;

    address public patient = address(0x1);
    address public doctor = address(0x3);
    address public stranger = address(0x4);

    function setUp() public {
        mediToken = new MockMediToken();
        userSide = new UserSide(address(mediToken));

        mediToken.mint(patient, 10);
        mediToken.mint(doctor, 10);

        vm.prank(patient);
        userSide.createUser(
            "Alice",
            "1234 5678 9012",
            "",
            30,
            "alice@test.com",
            "",
            "",
            "",
            3
        );
    }

    function test_CreateUser_InitializesHistoryWithCorrectUserId() public view {
        uint256 patientId = userSide.userWalletAddresstoUserId(patient);
        (uint256 uid, bool isHandicap, bool isBp, bool isDiabetes, uint256 exp) =
            userSide.userIdtoPatientHistory(patientId);

        assertEq(uid, patientId);
        assertFalse(isHandicap);
        assertFalse(isBp);
        assertFalse(isDiabetes);
        assertEq(exp, 0);
    }

    function test_UpdateMyHistory_PatientCanUpdateOwnHistory() public {
        uint256 patientId = userSide.userWalletAddresstoUserId(patient);

        vm.prank(patient);
        userSide.updateMyHistory(true, false, true, 5);

        (uint256 uid, bool isHandicap, bool isBp, bool isDiabetes, uint256 exp) =
            userSide.userIdtoPatientHistory(patientId);

        assertEq(uid, patientId);
        assertTrue(isHandicap);
        assertFalse(isBp);
        assertTrue(isDiabetes);
        assertEq(exp, 5);
    }

    function test_UpdateMyHistory_EmitsPatientHistoryUpdatedEvent() public {
        uint256 patientId = userSide.userWalletAddresstoUserId(patient);

        vm.prank(patient);
        vm.expectEmit(true, true, false, false);
        emit UserSide.PatientHistoryUpdated(patientId, patient);
        userSide.updateMyHistory(false, true, false, 2);
    }

    function test_UpdateMyHistory_RevertsForUnregisteredCaller() public {
        vm.prank(stranger);
        vm.expectRevert("Caller is not a registered user");
        userSide.updateMyHistory(false, false, false, 0);
    }

    function test_UpdateMyHistory_RevertsForDisapprovedPatient() public {
        uint256 patientId = userSide.userWalletAddresstoUserId(patient);
        userSide.disApproveUser(patientId);

        vm.prank(patient);
        vm.expectRevert("User account is not verified");
        userSide.updateMyHistory(false, false, false, 0);
    }

    function test_UpdateMyHistory_RevertsForNonPatientRole() public {
        uint256 doctorId = userSide.totalUsers();
        vm.prank(doctor);
        userSide.createUser(
            "Dr Bob",
            "9876 5432 1098",
            "LIC123",
            40,
            "bob@clinic.com",
            "Cardiology",
            "",
            "",
            2
        );
        userSide.approveUser(doctorId);

        vm.prank(doctor);
        vm.expectRevert("Only patients can update their own history");
        userSide.updateMyHistory(false, false, false, 0);
    }
}
