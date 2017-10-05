import "./StandardToken.sol";

pragma solidity ^0.4.8;

contract Game {

    struct Player {
      bytes32 seed;
      uint256 miningEfficiency;
      uint256 miningSpeed;
      bool canSmelt;
      uint256[10] ownedGoods;
    }
    mapping (address => Player) public games;

    struct Good {
      bytes32 name;
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
    }

    function click() {
      //mints coin
      //can buy any number of goods
      //subject to miningSpeed and miningEfficiency
    }

    function buyGoods() {
      //buy any number of a single good
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

    function addGood() {
      //used up to ten times to add goods
    }

    function updateGood() {
      //to update the goods list 
    }

    function wipeGame() {
      //not sure needed, but might be handy
    }

  }