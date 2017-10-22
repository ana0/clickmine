pragma solidity ^0.4.15;

contract owned {
    function owned() public { owner = msg.sender; }
    address owner;

    // This contract only defines a modifier but does not use
    // it - it will be used in derived contracts.
    // The function body is inserted where the special symbol
    // "_;" in the definition of a modifier appears.
    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function changeOwner(address newOwner) onlyOwner public {
        owner = newOwner;
    }
}

contract mortal is owned {
    // This contract inherits the "onlyOwner"-modifier from
    // "owned" and applies it to the "close"-function, which
    // causes that calls to "close" only have an effect if
    // they are made by the stored owner.
    function close() onlyOwner public {
        selfdestruct(owner);
    }
}


contract Registrar is mortal {
    address public GameAddress;

    function Registrar(address adrs) owned() public { GameAddress = adrs; }

    function updateGameAddress(address adrs) onlyOwner public returns (bool success)
    {
      GameAddress = adrs;
      return true;
    }
}