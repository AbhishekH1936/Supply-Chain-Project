// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Supplier {

    struct supplies {
        string supplierPublicKey;
        string farmerPublicKey;
        string item;
    }
    
    function send() public payable { 
        address payable receiver; 
        receiver = address(uint160(0xE7fCE9c4C10F575417A8B8FC39Bfbf96e81B3914));
        receiver.transfer(200000000000000000);
    }
    
    function sendBal(address payable receiver,uint256 amount) external{
        receiver.transfer(amount);  
    }
}