var BridgeToken = artifacts.require("BridgeToken");

module.exports = function(deployer, network, accounts) {
  // deploy contract
  deployer.deploy(BridgeToken, accounts[0]);
};