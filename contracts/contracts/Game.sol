import "./Registrar.sol";
import "./ClickMineToken.sol";

pragma solidity ^0.4.8;

contract Game is ClickMineToken {

    struct Player {
      bytes32 seed;
      uint256 miningEfficiency;
      uint256 miningSpeed;
      bool canSmelt;
      uint256[10] ownedGoods;
      uint lastClick;
    }
    mapping (address => Player) public games;

    struct Good {
      string name;
      uint256 efficiencyBoost;
      uint256 speedBoost;
      uint256 cost;
    }
    Good[10] public goods;
    uint256 public tokensPerClick;

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
      games[msg.sender].lastClick = block.timestamp;
    }

    function click() {
      require(block.timestamp - games[msg.sender].lastClick <= games[msg.sender].lastClick);
      games[msg.sender].lastClick = block.timestamp;
      uint256 totalPayout = mul(games[msg.sender].miningEfficiency, tokensPerClick);
      mint(msg.sender, totalPayout);
      // should add buying goods?
    }

    function buyGoods(uint256 goodIdentifier, uint256 quantity) {
      //buy any number of a single good
      require(goodIdentifier >= 0 && goodIdentifier <= 10);
      uint256 totalCost = mul(goods[goodIdentifier].cost, quantity);
      uint256 totalSpeed = mul(goods[goodIdentifier].efficiencyBoost, quantity);
      uint256 totalEfficiency = mul(goods[goodIdentifier].speedBoost, quantity);
      require(balances[msg.sender] >= totalCost);
      require(games[msg.sender].miningEfficiency + totalEfficiency > games[msg.sender].miningEfficiency);
      require(games[msg.sender].miningSpeed + totalSpeed > games[msg.sender].miningSpeed);
      require(games[msg.sender].ownedGoods[goodIdentifier] + quantity > games[msg.sender].ownedGoods[goodIdentifier]);
      require(games[msg.sender].canSmelt);
      require(block.timestamp - games[msg.sender].lastClick <= games[msg.sender].lastClick);
      transferFrom(msg.sender, 0x0000000000000000000000000000000000000000, totalCost);
      games[msg.sender].miningEfficiency = games[msg.sender].miningEfficiency + totalEfficiency;
      games[msg.sender].miningSpeed = games[msg.sender].miningSpeed + totalSpeed;
      games[msg.sender].ownedGoods[goodIdentifier] = games[msg.sender].ownedGoods[goodIdentifier] + quantity;
    }

    function mul(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
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