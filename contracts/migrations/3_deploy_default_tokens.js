var Registrar = artifacts.require("./Registrar.sol");
var Game = artifacts.require("./Game.sol");
var ClickMineToken = artifacts.require("./ClickMineToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Game, "ClickMineToken", 0, "CLK")
  .then(() => {
  	deployer.deploy(Registrar, Game.address);
  })
};