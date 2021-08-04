pragma solidity >=0.4.21 <0.7.0;

contract MainEventBetting {
  /******************************
   * State
   ******************************/

  string public name = "MainEventBetting";
  address public owner;
  uint eventId;
  Event[] events;
  mapping (uint => mapping (address => Bet)) bets;
  /**
   * Used to keep an array of all the users that have placed bet(s)
   * per event.  This is useful for the payout because the contract
   * could iterate through all users, see who won, and just pay them.
   */
  mapping (uint => address payable[]) usersThatPlacedBets;

  /******************************
   * Structs
   ******************************/

  /**
   * Struct that represents a bet for a fight
   */
  struct Bet {
    address payable user;
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
   * Events
   ******************************/

  event BetSubmitted(address from, uint amount, uint fighterId);

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
   * Method for calculating the payout.  It assumes that the bet amount
   * is greater than 1000 wei; to avoid working with decimals, this assumption
   * must be made.  Also, it assumes that the odds are under 1000, in absolute value.
   * Plus, this should not be an issue, since it is expected that the user would
   * never want to bet below 1000, in total, for an event.
   */
  function calculatePayout(uint betAmount, int odds) public pure returns (uint payout) {
    if (odds > 0) {
      /**
       * If plus line/plus bet; assume bet is over 1000, which is required to avoid
       * floating point nums
       */
      payout = ((betAmount / 100) * uint(odds)) + betAmount;
    } else {
      uint oddsAbsoluteValue = uint(odds / -1); // HACK: Get absolute value for int and convert to uint.  Using uint(odds) alone will not get you absolute value.
      payout = ((betAmount * 100 / oddsAbsoluteValue)) + betAmount;
    }
  }

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
   * Method for getting bet
   */
  function getBet(uint idForEvent) public view returns (uint fighterId, uint amount, bool exists) {
    Bet memory betForEvent = bets[idForEvent][msg.sender];

    fighterId = betForEvent.fighterId;
    amount = betForEvent.amount;
    exists = betForEvent.exists;
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

  /**
   * Method for making a bet
   */
  function placeBet(uint idForEvent, uint fighterId, uint amount) public payable {
    require(idForEvent <= eventId - 1); // protect against invalid event

    address payable user = msg.sender;
    (uint originalValueFighterId, uint originalValueAmount, bool exists) = getBet(idForEvent);

    if (exists) {
      /**
       * Check that the user is not betting on another user
       */
      require(fighterId == originalValueFighterId);
      bets[idForEvent][user] = Bet(user, originalValueFighterId, (originalValueAmount + amount), true);
    } else {
      /**
       * Check that the user is using valid fighter id
       */
      require(fighterId == 1 || fighterId == 2);
      /**
       * Check that the bet is larger than a 1000 wei;
       * this is needed so that the math downsteam, in calculate
       * payout works properly.  See method for more.
       */
      require(amount > 1000);
      Bet memory newBet = Bet(user, fighterId, amount, true);
      bets[idForEvent][user] = newBet;
      usersThatPlacedBets[idForEvent].push(user);
    }

    emit BetSubmitted(user, amount, fighterId);
  }
}