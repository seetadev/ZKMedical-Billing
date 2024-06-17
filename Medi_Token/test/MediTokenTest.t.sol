// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DeployToken} from "../script/DeployToken.s.sol";
import {MediToken} from "../src/MediToken.sol";

contract MediTokenTest is Test {
    MediToken public mediToken;
    DeployToken public deployer;

    address bob = makeAddr("bob");
    address alice = makeAddr("alice");

    uint256 public constant STARTING_BALANCE = 100 ether;

    function setUp() public {
        deployer = new DeployToken();
        mediToken = deployer.run();

        vm.prank(msg.sender);
        mediToken.transfer(bob, STARTING_BALANCE);
    }

    function testBobBalance() public view {
        assertEq(STARTING_BALANCE, mediToken.balanceOf(bob));
    }

    function testAllowances() public {
        uint256 initialAllowance = 1000;

        // Bob approves alice to spend tokens on his behalf

        vm.prank(bob);
        mediToken.approve(alice, initialAllowance);

        uint256 transferAmount = 500;

        vm.prank(alice);
        mediToken.transferFrom(bob, alice, transferAmount);

        assertEq(mediToken.balanceOf(alice), transferAmount);
        assertEq(mediToken.balanceOf(bob), STARTING_BALANCE - transferAmount);
    }

    function testTransfer() public {
        uint256 amount = 1000;
        address receiver = address(alice);
        vm.prank(bob);
        mediToken.transfer(receiver, amount);
        assertEq(mediToken.balanceOf(receiver), amount);
    }
}
