const SecurityDeposit = artifacts.require("SecurityDeposit");

module.exports = function(deployer) {
  deployer.deploy(SecurityDeposit);
};