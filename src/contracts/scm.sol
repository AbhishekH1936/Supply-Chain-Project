pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Scm {
  mapping(string => string) signup;
  string[] usernames_signup = ["bharath123"];

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