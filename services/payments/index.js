const path = require('path')
const provider = 'mollie'

const providerPath = path.join(__dirname, provider)
module.exports = require(providerPath)