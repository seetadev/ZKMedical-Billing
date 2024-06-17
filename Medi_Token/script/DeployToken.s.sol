// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MediToken} from "../src/MediToken.sol";

contract DeployToken is Script {
    uint256 public constant INITIAL_SUPPLY = 1000 ether;

    function run() external returns (MediToken) {
        vm.startBroadcast();
        MediToken mediToken = new MediToken(INITIAL_SUPPLY);
        vm.stopBroadcast();
        return mediToken;
    }
}
