const Distributer = artifacts.require("Distributer");

module.exports = function (deployer) {
  deployer.deploy(Distributer);
};
