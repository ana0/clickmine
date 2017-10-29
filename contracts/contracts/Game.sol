import "./Registrar.sol";
import "./ClickMineToken.sol";

pragma solidity ^0.4.15;

contract Game is ClickMineToken {

  struct Player {
    bytes32 seed;
    uint256 miningEfficiency;
    uint256 miningSpeed;
    bool canSmelt;
    uint256[12] ownedGoods;
    uint lastClick;
    uint numClicks;
  }
  
  mapping (address => Player) public games;

  struct Good {
    string name;
    uint256 efficiencyBoost;
    uint256 speedBoost;
    uint256 cost;
  }

  Good[12] public goods;
  
  uint256 public tokensPerClick;
  
  function Game(uint256 tokens, string _tokenName, uint8 _decimalUnits, string _tokenSymbol)
    ClickMineToken(_tokenName, _decimalUnits, _tokenSymbol) public
  { tokensPerClick = tokens; }

  //functions available to the player

  function beginGame() public returns (bool success) 
  {
    //set initial game state 
    //will wipe game state if it exists
    //no mercy
    games[msg.sender].seed = block.blockhash(block.number - 1);
    games[msg.sender].miningEfficiency = 1;
    games[msg.sender].miningSpeed = 60000;
    games[msg.sender].canSmelt = false;
    games[msg.sender].ownedGoods = [0,0,0,0,0,0,0,0,0,0];
    games[msg.sender].lastClick = block.timestamp;
    games[msg.sender].numClicks = 0;
    return true;
  }

  function click() public returns (bool success) 
  {
    require(block.timestamp - games[msg.sender].lastClick <= games[msg.sender].lastClick);
    require(games[msg.sender].numClicks + 1 >= games[msg.sender].numClicks);
    games[msg.sender].lastClick = block.timestamp;
    games[msg.sender].numClicks = games[msg.sender].numClicks + 1;
    uint256 totalPayout = mul(games[msg.sender].miningEfficiency, tokensPerClick);
    mint(msg.sender, totalPayout);
    return true;
    // should add buying goods?
  }

  function buyGoods(uint256[] _toBuy) public returns (bool success)
  {
    require(_toBuy.length == 12);
    for (uint ident = 0; ident <= 11; ident++) {
      buyGood(ident, _toBuy[ident]);
    }
    return true;
  }

  function buyGood(uint256 goodIdentifier, uint256 quantity) public returns (bool success)
  {
    //buy any number of a single good
    require(goodIdentifier >= 0 && goodIdentifier <= 11);
    // uint256 totalCost = mul(goods[goodIdentifier].cost, quantity);
    // uint256 totalSpeed = mul(goods[goodIdentifier].efficiencyBoost, quantity);
    // uint256 totalEfficiency = mul(goods[goodIdentifier].speedBoost, quantity);
    uint256 totalEfficiency = goods[goodIdentifier].efficiencyBoost;
    uint256 totalSpeed = goods[goodIdentifier].speedBoost;
    uint256 totalCost = goods[goodIdentifier].cost;
    require(balances[msg.sender] >= totalCost);
    require(balances[msg.sender] - totalCost <= balances[msg.sender]);
    require(games[msg.sender].miningEfficiency + totalEfficiency >= games[msg.sender].miningEfficiency);
    require(games[msg.sender].miningSpeed - totalSpeed <= games[msg.sender].miningSpeed);
    require(games[msg.sender].ownedGoods[goodIdentifier] + quantity > games[msg.sender].ownedGoods[goodIdentifier]);
    balances[msg.sender] -= totalCost;
    games[msg.sender].miningEfficiency = games[msg.sender].miningEfficiency + totalEfficiency;
    games[msg.sender].miningSpeed = games[msg.sender].miningSpeed - totalSpeed;
    games[msg.sender].ownedGoods[goodIdentifier] = games[msg.sender].ownedGoods[goodIdentifier] + quantity;
    Transfer(msg.sender, 0x0000000000000000000000000000000000000000, totalCost);
    return true;
  }

  function mul(uint256 a, uint256 b) internal constant returns (uint256) 
  {
      uint256 c = a * b;
      assert(a == 0 || c / a == b);
      return c;
  }

    // function socialClick(address _friend) {
    //   //costs small amount of coin
    //   //mints more coins than costs at friends address
    //   //subject to miningSpeed and miningEfficiency
    // }

    // function smelt(address _friend) {
    //   //turns ephemeral coin into real coin . . . but how is it different from click?
    // }

  function goodsGetter(uint256 _index) constant public returns (string, uint256, uint256, uint256) 
  {
    require(_index >= 0 && _index <= 11);
    return (goods[_index].name, goods[_index].efficiencyBoost, goods[_index].speedBoost, goods[_index].cost);
  }

  function playerGetter(address _player) constant public returns (bytes32, uint256, uint256, bool, uint256[12], uint, uint)
  {
    //returns all relevant data for given player
    return (games[_player].seed, games[_player].miningEfficiency,
      games[_player].miningSpeed, games[_player].canSmelt, games[_player].ownedGoods, games[_player].lastClick,
      games[_player].numClicks);
  }

  function addGood(uint256 _index, string _name, uint256 _efficiencyBoost, uint256 _speedBoost, uint256 _cost) onlyOwner public returns (bool success)
  {
    //used up to ten times to add goods
    require(_index >= 0 && _index <= 11);
    goods[_index].name = _name;
    goods[_index].efficiencyBoost = _efficiencyBoost;
    goods[_index].speedBoost = _speedBoost;
    goods[_index].cost = _cost;
    return true;
  }

}