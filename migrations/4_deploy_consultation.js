const ConsultationContract = artifacts.require("ConsultationContract");

module.exports = function(deployer) {
  deployer.deploy(ConsultationContract);
};