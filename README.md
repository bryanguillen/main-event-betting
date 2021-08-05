# Main Event Betting

## Description

Main Event Betting is a smart contract application that allows users
to bet `eth` on MMA main events, UFC to be specific.  It's worth
emphasizing smart contract application again, as this
project does not yet have a front-end.  More on that below.

However, it's worth taking a look at what the smart contract can handle.  Below is
the flow for an event:

* Contract Owner (i.e. me) Creates Event
* Users Bet on a Fighter For Event
* Contract Owner Sends Payments To Winners

In summary, this application allows MMA fans to bet on the most current **main event**
for any given fight night (e.g. `UFC 264`), and if they win the bet, they make money.

_Note: A word on the math used for the payouts and odds.  The application uses traditional MMA style odds.  Examples: +400 for underdog and -300 for favorite.  For more on the math used to calculate payouts, please click [here](https://www.gamblingsites.com/blog/how-sports-betting-works-35875/)._

## Background

The reason I started this project is to learn more about Solidity by challenging myself
by implementing something that I would use.  And, since I am a huge MMA fan, thought
this would be an interesting project to help me learn more and have fun in the process.

## Flow In Detail

The following "details" are used to give you more context when reading the code.
I find that it helps knowing the problem that is being solved, in plain english,
when reading source.  =)

### Creating Events

As of now, the creation of events is a manual process.  Only I, the contract creator,
can create events.

### Users Betting

Note: Before diving into the user betting, it's important to note that the contract handles
money via Ethereum's `wei` denomination.  This is not a problem for the user though,
as interfaces can internally convert `eth` -> `wei`.

Now, as far as the user betting, here some constraints:

* User can only bet on one fighter per event
* User needs to bet at least `1000 wei`

Given the constraints, the process is pretty straight forward.  The user
simply sends `wei` for a fighter in a specific event.

And, if the user would like, the user could bet on the same fighter again before the event actually begins.

### Paying Winners

Once the event is over, I call this function that simply iterates through all of the
users that bet on a specific event, and for each user, the one who bet correctly,
makes money.

## Improvements

Below, are some improvements that can be made to the smart contract:

* Enforce Time Limit On Bet: Currently, there is no time limit on the bet.
  The user should not be able to bet, once the event has begun.
* Automate Bookends: Automate the calling of create events and payouts.
* Entire Fight Card: Allow the user to bet on multiple fights in a fight
  card, not just the main event.
* More Efficient Storage: Keep only reference data stored on blockchain.
  Currently, strings, odds, and more are stored on the blockchain.  Perhaps
  it is worth storing data in IPFS.
* UI: And of course, the biggest one of them all, add a front-end for this app.

Of course, there are more that be done; these are just the main ones.

## Project Structure

Below, I've highlighted the main files:

* `./contracts/MainEventBetting.sol`
* `./test/MainEventBetting.test.js`

## Running App

As mentioned above, this app does not yet have a front-end, and it is not deployed.
Thus, the best way to simulate usage, would be via the unit tests.

You can run those by going through the following steps (which assume you've cloned
the repository and you are in the root directory of the project).

* `npm i`
* `npx truffle test`