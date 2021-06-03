// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Transportation {

    string[] keyArray = ["dummy"];
    mapping (string => string[]) transToDist;
    mapping (string => string[]) distToTrans;


    // agro farmer money transfer to contract
    function setTransHiringArray (string memory keyValue) public {
        keyArray.push(keyValue);
    }
    function getAllKeys() public view returns(string[] memory) {
        return keyArray;
    }
    
    function setTransAndDist(string memory dist, string memory trans) public {
        string[] storage tTD = transToDist[trans];
        tTD.push(dist);
        transToDist[trans] = tTD;
        
        string[] storage dTT  = distToTrans[dist];
        dTT.push(trans);
        distToTrans[dist] = dTT;
    }
    
    function getHiredTrans(string memory dist) public view returns (string[] memory){
        return distToTrans[dist];
    }
    
    function getbookedDist(string memory trans) public view returns (string[] memory){
        return transToDist[trans];
    }
}