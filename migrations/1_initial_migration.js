const Distributer = artifacts.require("Distributer");
const FastToken = artifacts.require("FastToken");

module.exports = function (deployer) {
  deployer.deploy(Distributer);
  deployer.deploy(FastToken);
};
