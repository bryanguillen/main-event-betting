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
   * Struct that represents a bet for a fight
   */
  struct Bet {
    address user;
    uint fighterId;
    uint amount;
    bool exists;
  }

  /**
   * Struct that represents an event -- a fight
   */
  struct Event {
    Fighter fighter1;
    Fighter fighter2;
    uint id;
    uint winner;
    string name;
    uint date;
    mapping (address => Bet) bets;
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
   * Method for creating event 
   */
  function createEvent(string memory fighter1Name, int fighter1Odds, string memory fighter2Name, int fighter2Odds, string memory eventName, uint eventDate) public {
    require(msg.sender == owner);

    Fighter memory fighter1 = Fighter(fighter1Name, fighter1Odds, 1);
    Fighter memory fighter2 = Fighter(fighter2Name, fighter2Odds, 2);
    Event memory fightEvent = Event(fighter1, fighter2, eventId, 0, eventName, eventDate);

    events.push(fightEvent);

    eventId = eventId + 1;
  }
  
  /**
   * Method for returning the fighters' data for the most recent
   * event; it's the supplemental function for its sibling function
   */
  function getFightersForMostRecentEvent() public view returns (string memory fighter1Name, int fighter1Odds, uint fighter1Id, string memory fighter2Name, int fighter2Odds, uint fighter2Id) {
    require(events.length > 1);

    Event memory fightEvent = events[events.length - 1];
    Fighter memory fighter1 = fightEvent.fighter1;
    Fighter memory fighter2 = fightEvent.fighter2;

    fighter1Name = fighter1.name;
    fighter1Odds = fighter1.odds;
    fighter1Id = fighter1.id;
    fighter2Name = fighter2.name;
    fighter2Odds = fighter2.odds;
    fighter2Id = fighter2.id;
  }

  /**
   * Method for returning the most recent event.
   * It does not return the fighters, since
   * functions can't return structs.  Instead,
   * that is done by another method.
   */
  function getMostRecentEvent() public view returns (uint id, uint winner, string memory eventName, uint eventDate) {
    require(events.length > 1);

    Event memory fightEvent = events[events.length - 1];

    id = fightEvent.id;
    winner = fightEvent.winner;
    eventName = fightEvent.name;
    eventDate = fightEvent.date;
  }
}