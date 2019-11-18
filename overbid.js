const { Universal, Crypto } = require('@aeternity/aepp-sdk')
const request = require('request')
const BigNumber = require('bignumber.js')
const config = require('./config')

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

function fetchBids () {
  return new Promise((resolve, reject) => {
    console.log(`\nFetching bids for ${config.AENS_NAME} ...`)
    request({
      url: `${config.MIDDLEWARE_URL}/middleware/names/auctions/bids/${config.AENS_NAME}`,
      headers: {
        Accept: 'application/activity+json'
      }
    }, (err, response, body) => {
      if (err) {
        console.log('\n\n', err, '\n\n')
        return reject(err)
      }

      try {
        resolve(JSON.parse(body))
      } catch (err) {
        console.log('\n\n', err, '\n\n')
        return reject(err)
      }
    })
  })
}

;(async () => {
  const account = await Universal({
    url: config.NODE_URL,
    internalUrl: config.NODE_INTERNAL_URL,
    networkId: config.NETWORK_ID,
    keypair: {
      publicKey: config.PUBLIC_KEY,
      secretKey: config.SECRET_KEY
    }
  })

  const highest = highestBid(await fetchBids())
  if (!highest) {
    return console.log('No bids found')
  }

  const nameFee = BigNumber(highest.tx.name_fee).plus(BigNumber('0.5e18'))
  console.log('Current name fee:', highest.tx.name_fee)
  console.log('Making a bid with name fee =', nameFee.toString(), '...')
  await account.aensBid(config.AENS_NAME, nameFee)
  console.log('Done.')
})()