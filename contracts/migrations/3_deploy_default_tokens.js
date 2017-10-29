var Registrar = artifacts.require("./Registrar.sol");
var Game = artifacts.require("./Game.sol");
var ClickMineToken = artifacts.require("./ClickMineToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Game, 10, "ClickMineToken", 0, "CLK")
  .then((gameInstance) => {
    deployer.deploy(Registrar, Game.address)
    .then(() => {
      const game = Game.deployed();
      game.then((gameInstance) => {
        const addGoods = [
          gameInstance.addGood(0, 'Shovel', 3, 7, 5),
          gameInstance.addGood(1, 'Pan', 10, 2, 25),
          gameInstance.addGood(2, 'Sluice', 14, 5, 45),
          gameInstance.addGood(3, 'Smelter', 0, 0, 5),
          gameInstance.addGood(4, 'Spiral Panner', 20, 55, 155),
          gameInstance.addGood(5, 'Mecha-sluice', 34, 5, 245),
          gameInstance.addGood(6, 'Refinery', 5, 5, 325),
          gameInstance.addGood(7, 'Bucketwheel', 51, 102, 535),
          gameInstance.addGood(8, 'Drilling Machine', 80, 330, 1080),
          gameInstance.addGood(9, 'Tailings Dozer', 95, 710, 5550),
          gameInstance.addGood(10, 'Hydraulic Shovel', 145, 805, 10045),
          gameInstance.addGood(11, 'Haul Truck Behemoth', 170, 1204, 60060)
        ]
        Promise.all(addGoods).then((values) => {
          console.log(values)
        })
      })
    })
  })
};