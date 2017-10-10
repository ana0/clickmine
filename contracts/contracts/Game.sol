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

    function buyGoods(uint256[] _toBuy) returns (bool success)  {
      require(_toBuy.length == 10);
      for (uint ident = 0; ident <= 10; ident++) {
        buyGood(ident, _toBuy[ident]);
      }
      return true;
    }

    function buyGood(uint256 goodIdentifier, uint256 quantity) returns (bool success) {
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
      return true;
    }

  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
      uint256 c = a * b;
      assert(a == 0 || c / a == b);
      return c;
    }

    function socialClick(address _friend) {
      //costs small amount of coin
      //mints more coins than costs at friends address
      //subject to miningSpeed and miningEfficiency
    }

    function smelt(address _friend) {
      //turns ephemeral coin into real coin . . . but how is it different from click?
    }

    function goodsGetter() constant returns (
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256,
      uint256, string, uint256, uint256, uint256
      ) {
      return (0, goods[0].name, goods[0].efficiencyBoost, goods[0].speedBoost, goods[0].cost,
        1, goods[1].name, goods[1].efficiencyBoost, goods[1].speedBoost, goods[1].cost,
        2, goods[2].name, goods[2].efficiencyBoost, goods[2].speedBoost, goods[2].cost,
        3, goods[3].name, goods[3].efficiencyBoost, goods[3].speedBoost, goods[3].cost,
        4, goods[4].name, goods[4].efficiencyBoost, goods[4].speedBoost, goods[4].cost,
        5, goods[5].name, goods[5].efficiencyBoost, goods[5].speedBoost, goods[5].cost,
        6, goods[6].name, goods[6].efficiencyBoost, goods[6].speedBoost, goods[6].cost,
        7, goods[7].name, goods[7].efficiencyBoost, goods[7].speedBoost, goods[7].cost,
        8, goods[8].name, goods[8].efficiencyBoost, goods[8].speedBoost, goods[8].cost,
        9, goods[9].name, goods[9].efficiencyBoost, goods[9].speedBoost, goods[9].cost);
    }

    function playerGetter(address _player) constant returns (bytes32, uint256, uint256, bool, uint256[10], uint) {
      //returns all relevant data for given player
      return (games[_player].seed, games[_player].miningEfficiency,
        games[_player].miningSpeed, games[_player].canSmelt, games[_player].ownedGoods, games[_player].lastClick);
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

  }