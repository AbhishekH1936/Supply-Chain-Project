const Supplier = artifacts.require("Supplier");

module.exports = function(deployer) {
  deployer.deploy(Supplier);
};