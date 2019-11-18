# 4evaAENS

Automatic bidding for Aeternity name system.

## Description

`4evaAENS` is a small showcase prototype project, which is build in JS, by using [Aeternity JavaScript SDK](https://github.com/aeternity/aepp-sdk-js). This application automates all the activities, needed to "hold" a name in [Aeternity blockchain](https://github.com/aeternity/aeternity), this app allows a user to:

1. Preclaim and claim a given name (if the name wasn't found in the blockchain and there is no current auction for it).
2. Overbid the name auction.
3. Monitor and automatically bid for a given name with all funds available at the end of an auction.

## Usage

1. Clone the project and install dependencies
```
git clone https://github.com/u2467/4evaAens
cd 4evaAens
npm install
```

2. Now you need to start local network with docker
```
docker-compose up -d
```

3. Preclaim and claim name
```
node claim.js
```
Example output:
```
Preclaiming hacknplayAU.chain ...
Claiming hacknplayAU.chain ...
Done.
```

4. Start auction observer
```
node observe.js
```
Example output:
```
Auction observer started with following settings:

NODE_URL		 = http://localhost:3013
NODE_INTERNAL_URL	 = http://localhost:3013/internal
NETWORK_ID		 = ae_devnet
PUBLIC_KEY		 = ak_A9fdTdBvsBpq7snU7KHNkz7dwVa45SBn3LBdDeZZFmYABaMPG

Will bid for hacknplayAU.chain

Fetching bids for hacknplayAU.chain ...

Highest bid:
accountId 		 = ak_A9fdTdBvsBpq7snU7KHNkz7dwVa45SBn3LBdDeZZFmYABaMPG
nameFee 		 = 4636800000000000000
blockHeight 		 = 6

Auction will end at height 486. 435 blocks left
Will refresh in 10 seconds
```

5. Optionally overbid an auction (you can do this many times in new terminal window while the auction observer is still running)
```
node overbid.js
```
Example output:
```

Fetching bids for hacknplayAU.chain ...
Current name fee: 4636800000000000000
Making a bid with name fee = 5136800000000000000 ...
Done.
```

## Configuration

See [config.js](config.js) file.