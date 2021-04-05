// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Scm {
    
  address payable governingAuthority;

  constructor() public {
    address owner = msg.sender;
    governingAuthority = address(uint160(owner));
  }    
  
  // Ether stored in contract address
  uint256 public contractBalance;
  
  // get contractBalance
  function getContractBalance() public view returns (uint256) {
      return contractBalance;
  }
}