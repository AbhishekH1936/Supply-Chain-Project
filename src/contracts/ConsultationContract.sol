// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract ConsultationContract {

    // Ether stored in contract address
    uint256 public contractBalance;

    struct agroFarmerContract {
        string agroPublicKey;
        string farmerPublicKey;
        uint256 agroKey;
        uint256 farmerKey;
    }

    // agro-Farmer contract mappings
    mapping (string => agroFarmerContract) agroFarmer;
    string[] keyValueArray = ["dummy"];
    

    // set and get functions for agroFarmer
    function setAgroFarmer(string memory keyValue, string memory agroPublicKey, string memory farmerPublicKey, uint256 agroKey,uint256 farmerKey
    ) internal {
        agroFarmerContract memory contractObj =  agroFarmerContract(agroPublicKey, farmerPublicKey, agroKey, farmerKey);
        agroFarmer[keyValue] = contractObj;
    }

    function getAgroFarmer(string memory keyValue) public view returns (agroFarmerContract memory) {
        return agroFarmer[keyValue];
    }

    // agro farmer money transfer to contract
    function bookFarmerAgroContract (string calldata keyValue, string calldata agroPublicKey, string calldata farmerPublicKey, uint256 agroKey,uint256 farmerKey) external payable {
        setAgroFarmer(keyValue, agroPublicKey, farmerPublicKey, agroKey, farmerKey);
        keyValueArray.push(keyValue);
        contractBalance=address(this).balance;
    }
    function getAllKeyValue() public view returns(string[] memory){
        return keyValueArray;
    }


    // get contractBalance
    function getContractBalance() public view returns (uint256) {
        return contractBalance;
    }
}