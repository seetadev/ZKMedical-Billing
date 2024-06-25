// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {UserSide} from "../src/UserSide.sol";

contract DeployUserSide is Script {
    function run() external returns (UserSide) {
        vm.startBroadcast();
        UserSide userSide = new UserSide(
            0xc898870DF59123F346a0e3787966023e0ED78B93
        ); // Token Address on OP Sepolia testnet
        vm.stopBroadcast();
        return userSide;
    }
}
