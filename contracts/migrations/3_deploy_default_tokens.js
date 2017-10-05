var ClickMineToken = artifacts.require("./ClickMineToken.sol");
var Registrar = artifacts.require("./Registrar.sol");
var Game = artifacts.require("./Game.sol");

module.exports = function(deployer) {
  deployer.deploy(ClickMineToken);
  deployer.deploy(Registrar);
  deployer.deploy(Game);
};