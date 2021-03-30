// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Scm {
    
  address payable governingAuthority;

  constructor() public {
    address owner = msg.sender;
    governingAuthority = address(uint160(owner));
  }

  struct agroFarmerContract {
    string agroPublicKey;
    string farmerPublicKey;
    uint256 agroKey;
    uint256 farmerKey;
  }

  // agro-Farmer contract mappings
  mapping (string => agroFarmerContract) agroFarmer;
    
  // User data storage attributes
  mapping(string => string) signup;
  string[] usernames_signup = ["0x743a264D199d1133c3D3Eac18B91BB8E568b09Ea-admin"];
  string[] AdminDetails = ["0x743a264D199d1133c3D3Eac18B91BB8E568b09Ea-admin","Pass123@"];
  
  
  // Crop data storage attributes
  mapping(string => string[]) farmer_crops;
  mapping(string => string) cropInfo;
  string[] allCropId = ["a"];
  
  
  // Ether stored in contract address
  uint256 public contractBalance;
  
  
  // attribute to map farmer to his security deposit
  mapping(address => uint256) securityDeposit;
  
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
      contractBalance=address(this).balance;
  }

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
  
  // function checking for Admin login
  function validateAdmindetails(string memory pub_key, string memory pass) public view returns (bool) {
      if(keccak256(bytes(pub_key)) == keccak256(bytes(AdminDetails[0])) && keccak256(bytes(pass))==keccak256(bytes(AdminDetails[1]))){
          return true; 
      }
      return false;
  }
  
  
  // setters and getters for Farmer's crops, by different parameters
  function setFarmerCrops(string memory pub_key, string memory crop_hash, string memory crop_id) public {
      string[] storage cropArray = farmer_crops[pub_key];
      cropArray.push(crop_hash);
      farmer_crops[pub_key] = cropArray;
      
      cropInfo[crop_id] = crop_hash;
      
      allCropId.push(crop_id);
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
  
  
  // getters and setters for user registration
  function set_signup(string memory pub_key, string memory signup_hash) public {
    signup[pub_key] = signup_hash;
    usernames_signup.push(pub_key);
  }
  function get_signup(string memory pub_key) public view returns (string memory) {
    return signup[pub_key];
  }
  function get_usernames() public view returns (string[] memory) {
    return usernames_signup;
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
  function match_usernames(string memory pub_key) public view returns (bool){
    uint256 flag = 0;
    for(uint i=0; i< usernames_signup.length; i++){
      string memory x = usernames_signup[i];
      if (keccak256(bytes(x)) == keccak256(bytes(pub_key))) {
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