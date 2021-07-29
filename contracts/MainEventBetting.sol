pragma solidity >=0.4.21 <0.7.0;

contract MainEventBetting {
  /******************************
   * State
   ******************************/

  string public name = "MainEventBetting";
  address public owner;

  /******************************
   * Structs
   ******************************/

  /**
   * Struct that represents an event -- a fight
   */
  struct Event {
    uint date;
    Fighter fighter1;
    Fighter fighter2;
    uint id;
    uint winner;
  }

  /**
   * Struct representing a fighter
   */
  struct Fighter {
    string name;
    int odds;
    uint id;
  }

  /******************************
   * Constructor
   ******************************/

  /**
   * Used for setting initial sender as owner; there
   * should be an easier way to do this
   */
  constructor () public {
    owner = msg.sender;
  }
}