const { Crypto } = require('@aeternity/aepp-sdk')
const fs = require('fs')

const beneficiary = {
  publicKey: `ak_${Crypto.encodeBase58Check(fs.readFileSync('./docker/keys/beneficiary/key.pub'))}`,
  secretKey: fs.readFileSync('./docker/keys/beneficiary/key').toString('hex')
}

module.exports = {
  NODE_URL: process.env.NODE_URL || 'http://localhost:3013',
  NODE_INTERNAL_URL: process.env.NODE_INTERNAL_URL || 'http://localhost:3013/internal',
  NETWORK_ID: process.env.NETWORK_ID || 'ae_devnet',
  MIDDLEWARE_URL: process.env.MIDDLEWARE_URL || 'http://localhost:8080',
  PUBLIC_KEY: process.env.PUBLIC_KEY || beneficiary.publicKey,
  SECRET_KEY: process.env.SECRET_KEY || beneficiary.secretKey,
  AENS_NAME: process.env.AENS_NAME || 'hacknplayAU.chain'
}