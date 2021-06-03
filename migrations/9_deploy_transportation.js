const Transportation = artifacts.require("Transportation");

module.exports = function(deployer) {
  deployer.deploy(Transportation);
};