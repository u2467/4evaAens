const { Universal, TxBuilderHelper } = require('@aeternity/aepp-sdk')
const BigNumber = require('bignumber.js')

const publicKey = 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
const secretKey = 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca'
const name = 'hacknplayAU.chain'

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
  // const nameFee = TxBuilderHelper.computeBidFee(name)
  // return console.log(nameFee.plus(100).toString())
  return console.log(await account.height())
  // return console.log(TxBuilderHelper.computeAuctionEndBlock(name, 0))
  // const bid = await account.aensBid(name, nameFee)
  // console.log(bid)
}

init()