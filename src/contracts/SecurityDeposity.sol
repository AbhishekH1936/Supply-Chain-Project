// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract SecurityDeposit {

    // Ether stored in contract address
    uint256 public contractBalance;
    
    // attribute to map farmer to his security deposit
    mapping(address => uint256) securityDeposit;
    
    // get contractBalance
    function getContractBalance() public view returns (uint256) {
        return contractBalance;
    }

    // Getter and setters for securityDeposit
    function setSecurityDeposit () external payable {
        securityDeposit[msg.sender] = securityDeposit[msg.sender] + msg.value;
        contractBalance=address(this).balance;
    }
    function getSecurityDeposit () public view returns (uint256){
        return securityDeposit[msg.sender];
    }
}