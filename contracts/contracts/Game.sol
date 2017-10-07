import "./Registrar.sol";

pragma solidity ^0.4.8;

contract Game is mortal {

    struct Player {
      bytes32 seed;
      uint256 miningEfficiency;
      uint256 miningSpeed;
      bool canSmelt;
      uint256[10] ownedGoods;
    }
    mapping (address => Player) public games;

    struct Good {
      string name;
      uint256 efficiencyBoost;
      uint256 speedBoost;
      uint256 cost;
    }
    Good[10] public goods;

    //functions available to the player

    function beginGame() {
      //set initial game state 
      //will wipe game state if it exists
      //no mercy
      games[msg.sender].seed = block.blockhash(block.number - 1);
      games[msg.sender].miningEfficiency = 0;
      games[msg.sender].miningSpeed = 0;
      games[msg.sender].canSmelt = false;
      games[msg.sender].ownedGoods = [0,0,0,0,0,0,0,0,0,0];
    }

    function click() {
      //mints coin
      //can buy any number of goods
      //subject to miningSpeed and miningEfficiency
    }

    function buyGoods(address tokenAddress, uint256 goodIdentifier, uint256 quantity) {
      //buy any number of a single good
      uint256 totalCost = calcPriceOfGood(goodIdentifier, quantity);
    }

    function calcPriceOfGood(uint256 goodIdentifier, uint256 quantity) internal returns (uint256 price) {
      require(goodIdentifier >= 0 && goodIdentifier <= 10);
      uint256 totalCost = goods[goodIdentifier].cost * quantity;
      assert(goods[goodIdentifier].cost == 0 || totalCost / goods[goodIdentifier].cost == quantity);
      return totalCost;
    }

    function socialClick() {
      //costs small amount of coin
      //mints more coins than costs at friends address
      //subject to miningSpeed and miningEfficiency
    }

    //ui helpers

    function goodsGetter() {
      //return all stats for goods
    }

    function playerGetter() {
      //returns all relevant data for given player
    }

    function addGood(uint256 _index, string _name, uint256 _efficiencyBoost, uint256 _speedBoost, uint256 _cost) onlyOwner returns (bool success) {
      //used up to ten times to add goods
      require(_index >= 0 && _index <= 10);
      goods[_index].name = _name;
      goods[_index].efficiencyBoost = _efficiencyBoost;
      goods[_index].speedBoost = _speedBoost;
      goods[_index].cost = _cost;
      return true;
    }

    function wipeGame() {
      //not sure needed, but might be handy
    }

  }