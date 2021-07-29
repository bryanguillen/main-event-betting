const MainEventBetting = artifacts.require("./MainEventBetting.sol");

contract('MainEventBetting', (accounts) => {
  let mainEventBetting;
  
  before(async () => {
    mainEventBetting = await MainEventBetting.deployed();
  });

  describe('createEvent', () => {
    const createEvent = async (account = accounts[0], fighter1Name = 'Derrick Lewis', fighter2Name = 'Ciryl Gane', eventName = 'UFC 265' ) => {
      await mainEventBetting.createEvent(fighter1Name, 225, fighter2Name, -335, eventName, { from: account })

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
      const { id, winner, eventName } = await mainEventBetting.getMostRecentEvent(); 
      assert.equal(parseInt(id.toString()), 1);
      assert.equal(parseInt(winner.toString()), 0);
      assert.equal(eventName, 'UFC 266');
    });
  })
});