// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserSide.sol";

contract DoctorSide is UserSide {
    // State variables
    uint256 public totalAppointments = 1;
    uint256 public totalDocuments = 1;
    uint256 public totalSlots = 1;

    struct Appointment {
        uint256 appId;
        string appDate;
        string startTime;
        string endTime;
        string appSubject;
        string appFeedback;
        address patientWalletAddress;
        address doctorWalletAddress;
        bool isApproved;
        uint256 slotId;
        uint256 appType;
    }

    struct AppointmentTimeSlot {
        uint256 slotId;
        string slotDate;
        string startTime;
        string endTime;
        bool isBooked;
    }

    struct PatientReport {
        uint256 reportId;
        string reportName;
        address patientWalletAddress;
        address doctorWalletAddress;
        string ipfsHash;
    }

    // Mappings
    mapping(uint256 => Appointment) public appointmentIdtoAppointment;
    mapping(uint256 => uint256[]) public docIdtoAppointmentId; // mapping 1
    mapping(uint256 => uint256[]) public patIdtoAppointmentId; // mapping 2
    mapping(uint256 => mapping(string => AppointmentTimeSlot[]))
        public doctorIdtoDatetoTimeSlot; // mapping 3
    mapping(uint256 => bool) public slotIdtoBookingStatus;
    mapping(uint256 => AppointmentTimeSlot)
        public appointmentSlotIdtoAppointmentSlot;
    mapping(uint256 => PatientReport) public ReportIdtoPatintReport;
    mapping(uint256 => PatientReport[]) public patientIdtoReport; // mapping 4
    mapping(uint256 => PatientReport[]) public doctortIdtoReport; // mapping 5

    // Events

    // Modifiers

    // Constructor
    constructor(address _mediToken) UserSide(_mediToken) {
        createUser(
            "System Admin",
            "1234 5678 9012 3456",
            "109869",
            0,
            "mukulkolpe@gmail.com",
            "Moderator",
            "ipfs.io/ipfs/",
            "ipfs.io/ipfs/",
            1
        );
        approveUser(1);
    }

    // Functions

    // Public functions
    function uploadMedicalReprt(
        string memory _reportName,
        address _patientWalletAdress,
        address _doctorWalletAddress,
        string memory _ipfsHash
    ) public {
        PatientReport memory r1 = PatientReport(
            totalDocuments,
            _reportName,
            _patientWalletAdress,
            _doctorWalletAddress,
            _ipfsHash
        );
        ReportIdtoPatintReport[totalDocuments] = r1;
        uint256 patId = userWalletAddresstoUserId[_patientWalletAdress];
        uint256 doctorId = userWalletAddresstoUserId[_doctorWalletAddress];
        patientIdtoReport[patId].push(r1);
        doctortIdtoReport[doctorId].push(r1);
        totalDocuments++;
    }

    function openTimeslots(
        string memory _slotDate,
        string memory _startTime,
        string memory _endTime
    ) public {
        uint256 tempUserId = userWalletAddresstoUserId[msg.sender];
        User memory u1 = userIdtoUser[tempUserId];
        require(
            u1.userRole == 2 && u1.isVerified,
            "Only verified doctor can call this function"
        );
        AppointmentTimeSlot memory a1 = AppointmentTimeSlot(
            totalSlots,
            _slotDate,
            _startTime,
            _endTime,
            false
        );
        doctorIdtoDatetoTimeSlot[tempUserId][_slotDate].push(a1);
        appointmentSlotIdtoAppointmentSlot[totalSlots] = a1;
        totalSlots++;
    }

    function bookAppointment(
        string memory _appDate,
        string memory _startTime,
        string memory _endTime,
        string memory _appSubject,
        string memory _appFeedback,
        address _doctorWalletAddress,
        uint256 _slotId
    ) public {
        Appointment memory a1 = Appointment(
            totalAppointments,
            _appDate,
            _startTime,
            _endTime,
            _appSubject,
            _appFeedback,
            msg.sender,
            _doctorWalletAddress,
            false,
            _slotId,
            0
        );
        appointmentIdtoAppointment[totalAppointments] = a1;
        uint256 patId = userWalletAddresstoUserId[msg.sender];
        uint256 doctorId = userWalletAddresstoUserId[_doctorWalletAddress];
        require(
            i_mediToken.balanceOf(msg.sender) >= 5,
            "You need to hold atleast 5 MediTokens to book an appointment"
        );
        require(
            patId != 0 && doctorId != 0,
            "Patient wallet address and wallet address must be both registered into the system"
        );
        require(
            !userIdtoBlacklist[patId] && !userIdtoBlacklist[doctorId],
            "Either patient or doctor are blacklisted"
        );
        docIdtoAppointmentId[doctorId].push(totalAppointments);
        patIdtoAppointmentId[patId].push(totalAppointments);
        totalAppointments++;
    }

    function bookAppointmentEmergency(
        string memory _appDate,
        string memory _startTime,
        string memory _endTime,
        string memory _appSubject,
        string memory _appFeedback,
        address _doctorWalletAddress,
        uint256 _slotId
    ) public payable {
        require(
            i_mediToken.balanceOf(msg.sender) >= 10,
            "You need to hold atleast 10 MediTokens to book an emergency appointment"
        );
        Appointment memory a1 = Appointment(
            totalAppointments,
            _appDate,
            _startTime,
            _endTime,
            _appSubject,
            _appFeedback,
            msg.sender,
            _doctorWalletAddress,
            false,
            _slotId,
            1
        );
        appointmentIdtoAppointment[totalAppointments] = a1;
        uint256 patId = userWalletAddresstoUserId[msg.sender];
        uint256 doctorId = userWalletAddresstoUserId[_doctorWalletAddress];
        require(
            patId != 0 && doctorId != 0,
            "Patient wallet address and wallet address must be both registered into the system"
        );
        require(
            !userIdtoBlacklist[patId] && !userIdtoBlacklist[doctorId],
            "Either patient or doctor are blacklisted"
        );
        docIdtoAppointmentId[doctorId].push(totalAppointments);
        patIdtoAppointmentId[patId].push(totalAppointments);
        totalAppointments++;
    }

    function approveAppointment(uint256 _appId) public {
        uint256 doctorId = userWalletAddresstoUserId[
            appointmentIdtoAppointment[_appId].doctorWalletAddress
        ];
        require(
            msg.sender == userIdtoUser[doctorId].userWalletAddress,
            "Invalid doctor to approve the appointment"
        );
        require(
            userIdtoUser[doctorId].userRole == 2,
            "Only doctors can call this function"
        );

        appointmentIdtoAppointment[_appId].isApproved = true;
        slotIdtoBookingStatus[appointmentIdtoAppointment[_appId].slotId] = true;
    }

    // View functions
    function getMapping1length(
        uint256 _doctorId
    ) public view returns (uint256) {
        return docIdtoAppointmentId[_doctorId].length;
    }

    function getMapping2length(
        uint256 _patientId
    ) public view returns (uint256) {
        return patIdtoAppointmentId[_patientId].length;
    }

    function getMapping3length(
        uint256 _doctorId,
        string memory _date
    ) public view returns (uint256) {
        return doctorIdtoDatetoTimeSlot[_doctorId][_date].length;
    }

    function getMapping4length(
        uint256 _patientId
    ) public view returns (uint256) {
        return patientIdtoReport[_patientId].length;
    }

    function getMapping5length(
        uint256 _doctorId
    ) public view returns (uint256) {
        return doctortIdtoReport[_doctorId].length;
    }
}
