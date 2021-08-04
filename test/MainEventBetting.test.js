const MainEventBetting = artifacts.require("./MainEventBetting.sol");
const truffleAssert = require('truffle-assert');

contract('MainEventBetting', (accounts) => {
  /**
   * Mock Event Time: Declared in global scope of test
   * so that multiple describe blocks below can access
   * the same number.
   */
  const mockEventDate = Date.now();
  const createEvent = async (account = accounts[0], fighter1Name = 'Derrick Lewis', fighter2Name = 'Ciryl Gane', eventName = 'UFC 265', fighter1Odds = 225, fighter2Odds = -335) => {
    await mainEventBetting.createEvent(fighter1Name, fighter1Odds, fighter2Name, fighter2Odds, eventName, mockEventDate, { from: account });
  };
  let mainEventBetting;
  
  before(async () => {
    mainEventBetting = await MainEventBetting.deployed();
  });

  describe('calculatePayout', () => {
    it('should calculate payout for plus line', async () => {
      const payout1 = await mainEventBetting.calculatePayout(100, 250);
      const payout2 = await mainEventBetting.calculatePayout(3300, 250);
      assert.equal(parseInt(payout1.toString()), 350);
      assert.equal(parseInt(payout2.toString()), 11550);
    });
    
    it('should calculate payout for minus line', async () => {
      const payout1 = await mainEventBetting.calculatePayout(250, -250);
      const payout2 = await mainEventBetting.calculatePayout(3300, -250);
      assert.equal(parseInt(payout1.toString()), 350);
      assert.equal(parseInt(payout2.toString()), 4620);
    });
  });

  describe('createEvent', () => {
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
      const bet1 = await mainEventBetting.placeBet(EVENT_ID, 1, 10000, { from: accounts[0] });
      const bet2 = await mainEventBetting.placeBet(EVENT_ID, 2, 5000, { from: accounts[1] });
      truffleAssert.eventEmitted(bet1, 'BetSubmitted', (event) => {
        const { from, amount, fighterId } = event;
        return (
          from === accounts[0] &&
          parseInt(amount.toString()) === 10000 &&
          parseInt(fighterId.toString()) === 1
        );
      });
      truffleAssert.eventEmitted(bet2, 'BetSubmitted', (event) => {
        const { from, amount, fighterId } = event;
        return (
          from === accounts[1] &&
          parseInt(amount.toString()) === 5000 &&
          parseInt(fighterId.toString()) === 2
        );
      });
    });

    it('should allow a user to place a second bet, if betting on same fighter', async () => {
      try {
        const bet1 = await mainEventBetting.placeBet(EVENT_ID, 1, 50, { from: accounts[0] });
        truffleAssert.eventEmitted(bet1, 'BetSubmitted', (event) => {
          const { from, amount, fighterId } = event;
          return (
            from === accounts[0] &&
            parseInt(amount.toString()) === 50 &&
            parseInt(fighterId.toString()) === 1
          );
        });
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

  describe('getBet', () => {
    it('should get the current bet for an event', async () => {
      const betForUser1 = await mainEventBetting.getBet(1, { from: accounts[0] });
      /**
       * NOTE: For more on where the values below come from, view the tests
       * above in place bet; specifically the ones that place successful bets.
       */
      assert.equal(parseInt(betForUser1.fighterId.toString()), 1);
      assert.equal(parseInt(betForUser1.amount.toString()), 10050);
    });
  });

  describe('payWinners', () => {
    const EVENT_ID = 2; // comes from the fact that two other events were created before this test
    
    const ownerAccount = accounts[0];
    const bettor1 = accounts[4];
    const bettor1Amount = 3000;
    const bettor2 = accounts[5];
    const bettor2Amount = 10000;
    const bettor3 = accounts[6];
    const bettor3Amount = 5700;

    
    before(async () => {
      await mainEventBetting.send(1000000, { from: ownerAccount });
      
      bettor1OriginalBalance = await web3.eth.getBalance(bettor1);
      bettor2OriginalBalance = await web3.eth.getBalance(bettor2);
      bettor3OriginalBalance = await web3.eth.getBalance(bettor3);

      await createEvent(ownerAccount, 'Colby Covington', 'Kamaru Usman', 'UFC 268', 150, -200);

      await mainEventBetting.placeBet(EVENT_ID, 1, bettor1Amount, { from: bettor1 }); // expected payout 7500; using formula for calculatePayout
      await mainEventBetting.placeBet(EVENT_ID, 2, bettor2Amount, { from: bettor2 }); // none
      await mainEventBetting.placeBet(EVENT_ID, 1, bettor3Amount, { from: bettor3 }); // expected payout 8550; using formula for calculatePayout
    });

    it('should pay all of the winners', async () => {
      const tx = await mainEventBetting.payWinners(EVENT_ID, 1, { from: ownerAccount });

      truffleAssert.eventEmitted(tx,'WinnersPaid', async () => {
        /**
         * For each of the next three variables, the last number added is expected payout.
         * So, to keep things clean, we first subtract the amount and then add back the total
         * payout.  Note: For the last number, it was calculated using the formula for calculate payout.
         */
        const bettor1ExpectedPayout = bettor1OriginalBalance - bettor1Amount + 7500;
        const bettor2ExpectedPayout = bettor2OriginalBalance - bettor2Amount + 0;
        const bettor3ExpectedPayout = bettor3OriginalBalance - bettor3Amount + 8550;
      
        return (
          await web3.eth.getBalance(bettor1) === bettor1ExpectedPayout &&
          await web3.eth.getBalance(bettor2) === bettor2ExpectedPayout &&
          await web3.eth.getBalance(bettor3) === bettor3ExpectedPayout
        );
      });
    });
  });
});