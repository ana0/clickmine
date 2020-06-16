var Registrar = artifacts.require("./Registrar.sol");
var Game = artifacts.require("./Game.sol");
var ClickMineToken = artifacts.require("./ClickMineToken.sol");

module.exports = function(deployer) {
  return deployer.deploy(Game, 10, "ClickMineToken", 0, "CLK")
  .then((gameInstance) => {
    return deployer.deploy(Registrar, Game.address)
    .then(() => {
      const game = Game.deployed();
      return game.then((gameInstance) => {
        const addGoods = [
          gameInstance.addGood(0, 'Shovel', 3, 5, 5),
          gameInstance.addGood(1, 'Pan', 100, 20, 25),
          gameInstance.addGood(2, 'Sluice', 1400, 154, 135),
          gameInstance.addGood(3, 'Smelter', 0, 0, 5),
          gameInstance.addGood(4, 'Spiral Panner', 23906, 250, 575),
          gameInstance.addGood(5, 'Mecha-sluice', 93200006, 50, 10056),
          gameInstance.addGood(6, 'Refinery', 5, 5, 2890056),
          gameInstance.addGood(7, 'Bucketwheel', 220890008056, 302, 76890056),
          gameInstance.addGood(8, 'Propaganda Machine', 50, 130, 155055505550),
          gameInstance.addGood(9, 'Tailings Dozer', 995000457600, 10, 508100034100),
          gameInstance.addGood(10, 'Hydraulic Shovel', '66002990004781212000010', 105, 1901007710345),
          gameInstance.addGood(11, 'Haul Truck Behemoth', '5789604461865809771178549250434395392663499233282028201972879200395656481996', 204, '5000299000418955590')
        ]
        return Promise.all(addGoods).then((values) => {
          console.log(values)
        })
      })
    })
  })
};

