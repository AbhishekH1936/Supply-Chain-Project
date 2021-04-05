const Ratings = artifacts.require("Ratings");

module.exports = function(deployer) {
  deployer.deploy(Ratings);
};