// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DoctorSide} from "../src/DoctorSide.sol";

contract DeployDoctorSide is Script {
    function run() external returns (DoctorSide) {
        vm.startBroadcast();
        DoctorSide doctorSide = new DoctorSide(
            0x3B550adA770897B0b215e414e45354861357788c
        ); // Token Address on sepolia testnet
        vm.stopBroadcast();
        return doctorSide;
    }
}
