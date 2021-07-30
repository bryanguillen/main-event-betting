const MainEventBetting = artifacts.require("./MainEventBetting.sol");

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
      await mainEventBetting.createEvent(fighter1Name, 225, fighter2Name, -335, eventName, mockEventDate, { from: account })

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
});