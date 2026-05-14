// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DoctorSide} from "../src/DoctorSide.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockMediToken is ERC20 {
    constructor() ERC20("MediToken", "MEDT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DoctorSideTest is Test {
    DoctorSide public doctorSide;
    MockMediToken public mediToken;

    address public owner = address(1);
    address public doctor = address(2);
    address public patient = address(3);

    function setUp() public {
        vm.startPrank(owner);
        mediToken = new MockMediToken();
        // Owner needs at least 1 token to call createUser inside DoctorSide constructor
        mediToken.mint(owner, 100);
        doctorSide = new DoctorSide(address(mediToken));
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────
    // Constructor — System Admin setup
    // ─────────────────────────────────────────────

    function test_constructor_systemAdminCreatedAndApproved() public view {
        uint256 adminId = doctorSide.userWalletAddresstoUserId(owner);
        assertEq(adminId, 1);
        (,,,,,,,,,, , bool isVerified) = doctorSide.userIdtoUser(1);
        assertTrue(isVerified);
    }

    function test_constructor_totalUsersIsTwo() public view {
        // starts at 1, admin creation increments to 2
        assertEq(doctorSide.totalUsers(), 2);
    }

    // ─────────────────────────────────────────────
    // openTimeslots
    // ─────────────────────────────────────────────

    function _registerAndApproveDoctor() internal {
        mediToken.mint(doctor, 100);
        vm.prank(doctor);
        doctorSide.createUser(
            "Dr. Smith", "1111 2222 3333", "DOC001", 40,
            "drsmith@example.com", "Cardiology", "ipfs://img", "ipfs://deg", 2
        );
        uint256 doctorId = doctorSide.userWalletAddresstoUserId(doctor);
        vm.prank(owner);
        doctorSide.approveUser(doctorId);
    }

    function _registerPatient() internal {
        mediToken.mint(patient, 100);
        vm.prank(patient);
        doctorSide.createUser(
            "Patient Joe", "4444 5555 6666", "N/A", 30,
            "joe@example.com", "N/A", "ipfs://img", "ipfs://deg", 3
        );
    }

    function test_openTimeslots_revertsForUnverifiedUser() public {
        mediToken.mint(doctor, 100);
        vm.prank(doctor);
        doctorSide.createUser(
            "Dr. Smith", "1111 2222 3333", "DOC001", 40,
            "drsmith@example.com", "Cardiology", "ipfs://img", "ipfs://deg", 2
        );
        vm.prank(doctor);
        vm.expectRevert("Only verified doctor can call this function");
        doctorSide.openTimeslots("2025-01-01", "09:00", "10:00");
    }

    function test_openTimeslots_revertsForPatientRole() public {
        _registerPatient();
        vm.prank(patient);
        vm.expectRevert("Only verified doctor can call this function");
        doctorSide.openTimeslots("2025-01-01", "09:00", "10:00");
    }

    function test_openTimeslots_succedsForVerifiedDoctor() public {
        _registerAndApproveDoctor();
        vm.prank(doctor);
        doctorSide.openTimeslots("2025-01-01", "09:00", "10:00");
        uint256 doctorId = doctorSide.userWalletAddresstoUserId(doctor);
        uint256 slotCount = doctorSide.getMapping3length(doctorId, "2025-01-01");
        assertEq(slotCount, 1);
    }

    function test_openTimeslots_totalSlotsIncrements() public {
        _registerAndApproveDoctor();
        vm.prank(doctor);
        doctorSide.openTimeslots("2025-01-01", "09:00", "10:00");
        assertEq(doctorSide.totalSlots(), 2);
    }

    // ─────────────────────────────────────────────
    // bookAppointment
    // ─────────────────────────────────────────────

    function test_bookAppointment_revertsIfPatientHasInsufficientTokens() public {
        _registerAndApproveDoctor();
        mediToken.mint(patient, 4); // needs 5
        vm.prank(patient);
        doctorSide.createUser(
            "Patient Joe", "4444 5555 6666", "N/A", 30,
            "joe@example.com", "N/A", "ipfs://img", "ipfs://deg", 3
        );
        vm.prank(patient);
        vm.expectRevert("You need to hold atleast 5 MediTokens to book an appointment");
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
    }

    function test_bookAppointment_revertsIfPatientNotRegistered() public {
        _registerAndApproveDoctor();
        mediToken.mint(patient, 100);
        vm.prank(patient);
        vm.expectRevert("Patient wallet address and wallet address must be both registered into the system");
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
    }

    function test_bookAppointment_succeedsWithValidSetup() public {
        _registerAndApproveDoctor();
        _registerPatient();
        vm.prank(patient);
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
        assertEq(doctorSide.totalAppointments(), 2);
    }

    function test_bookAppointment_revertsIfPatientBlacklisted() public {
        _registerAndApproveDoctor();
        _registerPatient();
        uint256 patientId = doctorSide.userWalletAddresstoUserId(patient);
        vm.prank(owner);
        doctorSide.disApproveUser(patientId);
        vm.prank(patient);
        vm.expectRevert("Either patient or doctor are blacklisted");
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
    }

    // ─────────────────────────────────────────────
    // bookAppointmentEmergency
    // ─────────────────────────────────────────────

    function test_bookAppointmentEmergency_revertsIfInsufficientTokens() public {
        _registerAndApproveDoctor();
        mediToken.mint(patient, 9); // needs 10
        vm.prank(patient);
        doctorSide.createUser(
            "Patient Joe", "4444 5555 6666", "N/A", 30,
            "joe@example.com", "N/A", "ipfs://img", "ipfs://deg", 3
        );
        vm.prank(patient);
        vm.expectRevert("You need to hold atleast 10 MediTokens to book an emergency appointment");
        doctorSide.bookAppointmentEmergency(
            "2025-01-01", "09:00", "10:00", "Emergency", "", doctor, 1
        );
    }

    function test_bookAppointmentEmergency_succeedsWithSufficientTokens() public {
        _registerAndApproveDoctor();
        _registerPatient();
        vm.prank(patient);
        doctorSide.bookAppointmentEmergency(
            "2025-01-01", "09:00", "10:00", "Emergency", "", doctor, 1
        );
        assertEq(doctorSide.totalAppointments(), 2);
    }

    // ─────────────────────────────────────────────
    // approveAppointment
    // ─────────────────────────────────────────────

    function test_approveAppointment_setsIsApprovedTrue() public {
        _registerAndApproveDoctor();
        _registerPatient();
        vm.prank(patient);
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
        vm.prank(doctor);
        doctorSide.approveAppointment(1);
        (,,,,,,,,bool isApproved,,) = doctorSide.appointmentIdtoAppointment(1);
        assertTrue(isApproved);
    }

    function test_approveAppointment_revertsForWrongDoctor() public {
        _registerAndApproveDoctor();
        _registerPatient();
        vm.prank(patient);
        doctorSide.bookAppointment(
            "2025-01-01", "09:00", "10:00", "Checkup", "", doctor, 1
        );
        vm.prank(patient);
        vm.expectRevert("Invalid doctor to approve the appointment");
        doctorSide.approveAppointment(1);
    }

    // ─────────────────────────────────────────────
    // uploadMedicalReport
    // ─────────────────────────────────────────────

    function test_uploadMedicalReport_incrementsTotalDocuments() public {
        _registerAndApproveDoctor();
        _registerPatient();
        doctorSide.uploadMedicalReprt(
            "Blood Test", patient, doctor, "ipfs://report1"
        );
        assertEq(doctorSide.totalDocuments(), 2);
    }

    function test_uploadMedicalReport_appearsInPatientReports() public {
        _registerAndApproveDoctor();
        _registerPatient();
        doctorSide.uploadMedicalReprt(
            "Blood Test", patient, doctor, "ipfs://report1"
        );
        uint256 patientId = doctorSide.userWalletAddresstoUserId(patient);
        assertEq(doctorSide.getMapping4length(patientId), 1);
    }
}
