pragma solidity >=0.4.21 <0.7.0;

contract MainEventBetting {
  /******************************
   * State
   ******************************/

  string public name = "MainEventBetting";
  address public owner;
  uint eventId;
  Event[] events;

  /******************************
   * Structs
   ******************************/

  /**
   * Struct that represents an event -- a fight
   */
  struct Event {
    // uint date; comment out for now to keep things simple
    Fighter fighter1;
    Fighter fighter2;
    uint id;
    uint winner;
    string name;
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

  /******************************
   * Methods
   ******************************/
  
  /**
   * Method for returning the most recent event.
   * It does not return the fighters, since
   * functions can't return structs.  Instead,
   * that is done by another method.
   */
  function getMostRecentEvent() public view returns (uint id, uint winner, string memory eventName) {
    require(events.length > 1);

    Event memory fightEvent = events[events.length - 1];

    id = fightEvent.id;
    winner = fightEvent.winner;
    eventName = fightEvent.name;

    return (id, winner, eventName);
  }

  /**
   * Method for creating event 
   */
  function createEvent(string memory fighter1Name, int fighter1Odds, string memory fighter2Name, int fighter2Odds, string memory eventName) public {
    require(msg.sender == owner);

    Fighter memory fighter1 = Fighter(fighter1Name, fighter1Odds, 1);
    Fighter memory fighter2 = Fighter(fighter2Name, fighter2Odds, 2);
    Event memory fightEvent = Event(fighter1, fighter2, eventId, 0, eventName);

    events.push(fightEvent);

    eventId = eventId + 1;
  }
}