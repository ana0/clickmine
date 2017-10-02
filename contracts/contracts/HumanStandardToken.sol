import "./StandardToken.sol";

pragma solidity ^0.4.8;

contract ClickMineToken is StandardToken {

    /* Public variables of the token */

    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol;                 //An identifier: eg SBX

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

    function ClickMineToken(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        ) {
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        totalSupply = _initialAmount;                        // Update total supply
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes
    }

    /* Approves and then calls the receiving contract */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);

        //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
        //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
        //it is assumed that when does this that the call *should* succeed, otherwise one would use vanilla approve instead.
        require(_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData));
        return true;
    }

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

    //administrative

    function drain() {
      //in case anyone sends eth to the contract
    }

    function changeOwner() {
      //in case ownership needs to transfer
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