const { Universal, TxBuilderHelper } = require('@aeternity/aepp-sdk')
const BigNumber = require('bignumber.js')
const request = require('request')

// TO RUN LOCALY COPY COMMAND BELOW:
//
// PUBLIC_KEY=ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU SECRET_KEY=bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca NODE_URL=http://localhost:3013 NODE_INTERNAL_URL=http://localhost:3113 NETWORK_ID=ae_devnet MIDDLEWARE_URL=http://localhost:8080 NAME=hacknplayAU.chain node server.js
//
//

const publicKey = process.env.PUBLIC_KEY
const secretKey = process.env.SECRET_KEY
const nodeUrl = process.env.NODE_URL
const nodeInternalUrl = process.env.NODE_INTERNAL_URL
const networkId = process.env.NETWORK_ID
const middlewareUrl = process.env.MIDDLEWARE_URL
const name = process.env.NAME

function getBids (name, callback) {
  request({
    // polliing the mdw until subscriptions for names are available
    url: `${middlewareUrl}/middleware/names/auctions/bids/${name}`,
    headers: {
      Accept: 'application/activity+json'
    }
  }, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    try {
      const json = JSON.parse(body)
      callback(null, json)
    } catch (err) {
      callback(err)
    }
  })
}

function getName (name, callback) {
  request({
    url: `${middlewareUrl}/middleware/names/${name.toLowerCase()}`,
    headers: {
      Accept: 'application/activity+json'
    }
  }, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    try {
      const json = JSON.parse(body)
      callback(null, json)
    } catch (err) {
      callback(err)
    }
  })
}

function highestBid (bids) {
  return bids.sort((a, b) => {
    const nameFeeA = BigNumber(a.tx.name_fee)
    const nameFeeB = BigNumber(b.tx.name_fee)
    if (nameFeeA.lt(nameFeeB)) {
      return 1
    }
    if (nameFeeA.gt(nameFeeB)) {
      return -1
    }
    return 0
  })[0]
}

function poll (account, name, endHeight) {
  const interval = 5 * 1000
  setTimeout(() => {
    console.log(`\nChecking if there are any bids for ${name}`)
    getBids(name, (err, result) => {
      if (err) {
        return console.log('There was an error getting bids info', err)
      }
      const highest = highestBid(result)
      if (highest) {
        console.log(`Highest bid is done by ${highest.tx.account_id} with ${highest.tx.name_fee} at ${highest.block_height} height`)
      } else {
        console.log('No bids yet')
      }

      if (!endHeight) {
        getName(name, (err, result) => {
          if (err) {
            return console.log('There was an error getting name info', err)
          }
          if (result.length) {
            setTimeout(() => poll(account, name, result[0].auction_end_height), interval)
          } else {
            setTimeout(() => poll(account, name), interval)
          }
        })
      } else {
        account.height()
        .then((currentHeight) => {
          const blocksLeft = endHeight - currentHeight
          console.log(`Auction will end at ${endHeight}. Blocks left till end: ${blocksLeft}`)
          if (blocksLeft <= 320) {
            // TODO: make bid
            console.log('MAKING A BID')
            account.aensBid(name, BigNumber(highest.tx.name_fee).plus(1e18))
            .then(result => console.log(result))
            .catch(err => console.log(err))
          } else {
            setTimeout(() => poll(account, name, endHeight), interval)
          }
        })
        .catch(err => console.log(err))
      }
    })
  }, interval)
}

;(async function () {
  const account = await Universal({
    url: nodeUrl,
    internalUrl: nodeInternalUrl,
    networkId,
    keypair: {
      publicKey,
      secretKey
    }
  })

  console.log(`Name bid server started with account ${await account.address()} and name ${name}`)

  poll(account, name)
})()