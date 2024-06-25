// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DoctorSide} from "../src/DoctorSide.sol";

contract DeployDoctorSide is Script {
    function run() external returns (DoctorSide) {
        vm.startBroadcast();
        DoctorSide doctorSide = new DoctorSide(
            0xc898870DF59123F346a0e3787966023e0ED78B93
        ); // Token Address on OP Sepolia testnet
        vm.stopBroadcast();
        return doctorSide;
    }
}
