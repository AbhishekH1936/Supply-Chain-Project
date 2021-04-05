// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Crops {
    // Crop data storage attributes
    mapping(string => string[]) farmer_crops;
    mapping(string => string) cropInfo;
    mapping (string => string[]) cropContract;
    string[] allCropId = ["a"];
    uint256[] usedKeys = [1];


    // setters and getters for Farmer's crops, by different parameters
    function setFarmerCrops(string memory pub_key, string memory crop_hash, string memory crop_id, string memory agro_key, uint256 keyPhrase) public {
        string[] storage cropArray = farmer_crops[pub_key];
        cropArray.push(crop_id);
        farmer_crops[pub_key] = cropArray;
        
        cropInfo[crop_id] = crop_hash;

        string[] storage cropIds = cropContract[agro_key];
        cropIds.push(crop_id);
        cropContract[agro_key] = cropIds;
        
        allCropId.push(crop_id);
        usedKeys.push(keyPhrase);
    }
    function getFarmerCrops(string memory pub_key) public view returns(string[] memory){
        return farmer_crops[pub_key];
    }
    function getCropByCropId(string memory crop_id) public view returns(string memory){
        return cropInfo[crop_id];
    }
    function getAllCropId() public view returns(string[] memory){
        return allCropId;
    }
    function getAgroCrops(string memory pub_key) public view returns(string[] memory){
        return cropContract[pub_key];
    }
    function getAllUsedKeys() public view returns(uint256[] memory){
        return usedKeys;
    }

    // functions checking for matching Id's
    function match_cropId(string memory crop_id) public view returns (bool){
        uint256 flag = 0;
        for(uint i=0; i< allCropId.length; i++){
        string memory x = allCropId[i];
        if (keccak256(bytes(x)) == keccak256(bytes(crop_id))) {
            flag=1;
            break;
        }
        }
        if (flag == 1) {
            return true;
        }
        return false;
    }
}