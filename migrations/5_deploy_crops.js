const Crops = artifacts.require("Crops");

module.exports = function(deployer) {
  deployer.deploy(Crops);
};