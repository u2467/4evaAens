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

  console.log('Auction observer started with following settings:\n')
  console.log('NODE_URL\t\t =', config.NODE_URL)
  console.log('NODE_INTERNAL_URL\t =', config.NODE_INTERNAL_URL)
  console.log('NETWORK_ID\t\t =', config.NETWORK_ID)
  console.log('PUBLIC_KEY\t\t =', config.PUBLIC_KEY)

  console.log(`\nWill bid for ${config.AENS_NAME}`)

  let nameDetails
  const fetchNameDetails = async () => {
    if (nameDetails) {
      return nameDetails
    }

    nameDetails = await new Promise((resolve, reject) => {
      request({
        url: `${config.MIDDLEWARE_URL}/middleware/names/${config.AENS_NAME.toLowerCase()}`,
        headers: {
          Accept: 'application/activity+json'
        }
      }, (err, response, body) => {
        if (err) {
          console.log('\n\n', err, '\n\n')
          return reject(err)
        }

        try {
          resolve(JSON.parse(body)[0])
        } catch (err) {
          console.log('\n\n', err, '\n\n')
          return reject(err)
        }
      })
    })
    return nameDetails
  }

  let bids = []
  while (bids && !bids.length) {
    bids = await fetchBids()
    if (!highestBid(bids)) {
      console.log('No bids found. Will check again in 10 seconds')
      await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
    }
  }

  let nearAuctionEnd = false
  while (!nearAuctionEnd) {
    const highest = highestBid(bids)
    const details = await fetchNameDetails()
    const endHeight = details.auction_end_height
    const blocksLeft = endHeight - await account.height()
    
    console.log('\nHighest bid:')
    console.log('accountId \t\t =', highest.tx.account_id)
    console.log('nameFee \t\t =', highest.tx.name_fee)
    console.log('blockHeight \t\t =', highest.block_height)
    console.log(`\nAuction will end at height ${endHeight}. ${blocksLeft} blocks left`)

    if (blocksLeft <= 1) {
      nearAuctionEnd = true
    } else {
      console.log('Will refresh in 10 seconds')
      await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
      bids = await fetchBids()
    }
  }

  console.log('\nMAKING A BID')
  const balance = BigNumber(await account.balance(await account.address()))
  const txParams = await account.prepareTxParams('nameClaimTx', {
    sender: await account.address(),
    accountId: await account.address(),
    name: `nm_${Crypto.encodeBase58Check(config.AENS_NAME)}`,
    nameSalt: 0
  })
  const fee = BigNumber(txParams.fee).multipliedBy(3)
  const nameFee = balance.minus(fee)
  await account.aensBid(config.AENS_NAME, nameFee, { fee })
  console.log('Done.')
})()