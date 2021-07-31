const MainEventBetting = artifacts.require("./MainEventBetting.sol");
const truffleAssert = require('truffle-assert');

contract('MainEventBetting', (accounts) => {
  /**
   * Mock Event Time: Declared in global scope of test
   * so that multiple describe blocks below can access
   * the same number.
   */
  const mockEventDate = Date.now();
  let mainEventBetting;
  
  before(async () => {
    mainEventBetting = await MainEventBetting.deployed();
  });

  describe('createEvent', () => {
    const createEvent = async (account = accounts[0], fighter1Name = 'Derrick Lewis', fighter2Name = 'Ciryl Gane', eventName = 'UFC 265' ) => {
      await mainEventBetting.createEvent(fighter1Name, 225, fighter2Name, -335, eventName, mockEventDate, { from: account });
    };

    it('should be able to create an event multiple times', async () => {
      try {
        await createEvent();
        await createEvent(accounts[0], 'Conor McGregor', 'Dustin Porier', 'UFC 266');
        assert.isOk(true);
      } catch (error) {
        assert.isOk(false, 'Should allow the contract owner to create an event');
      }
    });
    
    it('should only allow the contract creator to create an event', async () => {
      try {
        await createEvent(accounts[1]);
        assert.isOk(false, 'Should not allow a different user to create an event');
      } catch (error) {
        assert.isOk(error);
      }
    });
  });

  describe('getMostRecentEvent', () => {
    it('should get the most recent event data, excluding the fighter\'s data', async () => {
      const { id, winner, eventName, eventDate } = await mainEventBetting.getMostRecentEvent(); 
      assert.equal(parseInt(id.toString()), 1);
      assert.equal(parseInt(winner.toString()), 0);
      assert.equal(eventName, 'UFC 266');
      assert.equal(parseInt(eventDate.toString()), mockEventDate);
    });
  });

  describe('getFightersForMostRecentEvent', () => {
    it('should get the fighter data from the most recent event', async () => {
      const {
        fighter1Name,
        fighter1Odds,
        fighter1Id,
        fighter2Name,
        fighter2Odds,
        fighter2Id
      } = await mainEventBetting.getFightersForMostRecentEvent(); 
      assert.equal(fighter1Name, 'Conor McGregor');
      assert.equal(parseInt(fighter1Odds.toString()), 225);
      assert.equal(parseInt(fighter1Id.toString()), 1);
      assert.equal(fighter2Name, 'Dustin Porier');
      assert.equal(parseInt(fighter2Odds.toString()), -335);
      assert.equal(parseInt(fighter2Id.toString()), 2);
    });
  });

  describe('placeBet', () => {
    /**
     * Note: For the event ids for placing bet use 1, since that is the most recent
     * one, and as of this writing, there is no simple way to a specific event
     */
    const EVENT_ID = 1;
    
    it('should allow multiple users to place a bet', async () => {
      await mainEventBetting.placeBet(EVENT_ID, 1, 100, { from: accounts[0] });
      await mainEventBetting.placeBet(EVENT_ID, 2, 50, { from: accounts[1] });
      const betForUser1 = await mainEventBetting.getBet(EVENT_ID, { from: accounts[0] });
      const betForUser2 = await mainEventBetting.getBet(EVENT_ID, { from: accounts[1] });
      // user 1
      assert.equal(parseInt(betForUser1.fighterId.toString()), 1);
      assert.equal(parseInt(betForUser1.amount.toString()), 100);
      // user 2
      assert.equal(parseInt(betForUser2.fighterId.toString()), 2);
      assert.equal(parseInt(betForUser2.amount.toString()), 50);
    });

    it('should allow a user to place a second bet, if betting on same fighter', async () => {
      try {
        await mainEventBetting.placeBet(EVENT_ID, 1, 50, { from: accounts[0] });
        const betForUser1 = await mainEventBetting.getBet(EVENT_ID, { from: accounts[0] });
        assert.equal(parseInt(betForUser1.fighterId.toString()), 1);
        assert.equal(parseInt(betForUser1.amount.toString()), 150);
      } catch (error) {
        assert.ok(false, 'User should be able to add more to bet');
      }
    });

    it('should not allow a user to place another bet on a different fighter from the original bet', async () => {
      try {
        await mainEventBetting.placeBet(EVENT_ID, 2, 50, { from: accounts[0] });
        assert.ok(false, 'User should not be able to place a bet on a different fighter');
      } catch (error) {
        assert.ok(true);
      }
    });

    it('should not allow a user to place a bet if invalid id for event', async () => {
      try {
        await mainEventBetting.placeBet(10, 1, 50, { from: accounts[2] });
        assert.ok(false, 'User should not be able to place a bet on a non-existent event');
      } catch (error) {
        assert.ok(true);
      }
    });
    
    it('should not allow a user to place a bet if invalid id for fighter', async () => {
      try {
        await mainEventBetting.placeBet(EVENT_ID, 10, 50, { from: accounts[2] });
        assert.ok(false, 'User should not be able to place a bet on a non-existent fighter');
      } catch (error) {
        assert.ok(true);
      }
    });
  });

  describe('fallback payable', () => {
    it('should increase the balance', async () => {
      const tx = await mainEventBetting.send(100);
      truffleAssert.eventEmitted(tx, 'Paid', (event) => {
        const { from, value } = event;
        return from === accounts[0] && parseInt(value.toString()) === 100;
      });
      assert.equal(parseInt((await mainEventBetting.balance()).toString()), 100);
    });
  });
});