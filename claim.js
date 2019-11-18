const { Universal } = require('@aeternity/aepp-sdk')
const config = require('./config')

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

  console.log(`Preclaiming ${config.AENS_NAME} ...`)
  const { claim } = await account.aensPreclaim(config.AENS_NAME)
  console.log(`Claiming ${config.AENS_NAME} ...`)
  await claim()
  console.log('Done.')
})()