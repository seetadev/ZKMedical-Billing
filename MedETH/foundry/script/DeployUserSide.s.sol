// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {UserSide} from "../src/UserSide.sol";

contract DeployUserSide is Script {
    function run() external returns (UserSide) {
        vm.startBroadcast();
        UserSide userSide = new UserSide(
            0x3B550adA770897B0b215e414e45354861357788c
        ); // Token Address on sepolia testnet
        vm.stopBroadcast();
        return userSide;
    }
}
