const UserData = artifacts.require("UserData");

module.exports = function(deployer) {
  deployer.deploy(UserData);
};