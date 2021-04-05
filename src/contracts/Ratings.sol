// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Ratings {

    // cropId to pre,post,harvest array
    mapping(string => string[]) cropRatings;
    // cropId to rating hash for each crop
    mapping(string => string) farmerRatingPerCrop;

    // ratings function
    function setCropRatings(string memory crop_id, string memory hash) public {
        cropRatings[crop_id].push(hash);
    }
    function getCropRatings(string memory crop_id) public view returns(string[] memory){
        return cropRatings[crop_id];
    }
    function setFarmerRatings(string memory crop_id, string memory hash) public {
        farmerRatingPerCrop[crop_id] = hash;
    }
    function getFarmerRatings(string memory crop_id) public view returns(string memory){
        return farmerRatingPerCrop[crop_id];
    }
}