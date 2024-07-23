// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MedInvoiceContract is Ownable {
    mapping(address => string[]) private fileList;
    IERC20 public immutable i_mediToken;

    event FileSaved(address indexed user, string file, uint256 timestamp);

    constructor(address _mediToken) Ownable(msg.sender) {
        i_mediToken = IERC20(_mediToken);
    }

    function saveFile(string memory _file) public {
        require(bytes(_file).length > 0, "File content cannot be empty");
        require(i_mediToken.balanceOf(msg.sender) >= 1, "You need to hold a MediToken to save.");
        fileList[msg.sender].push(_file);
        emit FileSaved(msg.sender, _file, block.timestamp);
    }

    function getFiles() public view returns (string[] memory) {
        require(i_mediToken.balanceOf(msg.sender) >= 1, "You need to hold a MediToken to view saved files.");
        return fileList[msg.sender];
    }
    
    function getUserTokens() public view returns (uint256) {
        return i_mediToken.balanceOf(msg.sender);
    }
}
