const { Universal, TxBuilderHelper } = require('@aeternity/aepp-sdk')
const BigNumber = require('bignumber.js')
const request = require('request')

const publicKey = 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
const secretKey = 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca'
const name = 'hacknplayAU.chain'
const middlewareUrl = 'http://localhost:8080'

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

function bid (account) {
  console.log('\nbid')
  const interval = 5 * 1000
  setTimeout(() => {
    getBids(name, (err, bids) => {
      if (err) {
        console.log(err)
        return bid(account)
      }
      const highest = highestBid(bids)
      console.log(highest)
      if (highest) {

        const nameFee = TxBuilderHelper.computeBidFee(name, BigNumber(highest.tx.name_fee).plus(10000000))
        console.log(nameFee.toString())
        account.aensBid(name, nameFee)
        .then(result => {
          console.log(result)
          bid(account)
        })
        .catch(err => console.log(err))

      } else {
        bid(account)
      }
    })
  }, interval)
}

async function init () {
  const account =  await Universal({
    url: 'http://localhost:3013',
    internalUrl: 'http://localhost:3113',
    networkId: 'ae_devnet',
    keypair: {
      publicKey,
      secretKey
    }
  })

    // const preclaim = await account.aensPreclaim(name)
    // console.log(preclaim)
    // const claim = await preclaim.claim()
    // console.log(claim)

    return console.log(await account.balance(await account.address()))
    // bid(account)

    // const nameFee = TxBuilderHelper.computeBidFee(name)
    // const bid = await account.aensBid(name, nameFee.plus(10000))
    // console.log(bid)
  // const nameFee = TxBuilderHelper.computeBidFee(name)
  // return console.log(nameFee.plus(100).toString())
  // return console.log(awaint account.height())
  // return console.log(TxBuilderHelper.computeAuctionEndBlock(name, 0))
  // const bid = await account.aensBid(name, nameFee)
  // console.log(bid)
}

init()