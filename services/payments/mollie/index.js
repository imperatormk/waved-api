const db = require(__basedir + '/db/controllers')
const mollieLib = require('@mollie/api-client')

const { MOLLIE_API_KEY, MODE } = process.env
const mollie = mollieLib({ apiKey: MOLLIE_API_KEY })

const currency = 'EUR' // TODO: unhardcode this?

const createPayment = async (processing) => {
  try {
    // we assume song will be present here
    const song = await db.songs.getSongById(processing.songId)

    const paymentObj = {
      amount: {
        value: song.price.toFixed(2),
        currency
      },
      description: `Payment for ${song.title}`
    }

    // TODO: fix this
    if (MODE === 'prod') {
      paymentObj.redirectUrl = 'doItHere'
      paymentObj.webhookUrl = 'doItHere'
    }

    const payment = await mollie.payments.create(paymentObj)
    const { id, status } =  payment
    const paymentUrl = payment.getPaymentUrl()

    // TODO: log/record this somehow?
    return { id, status, paymentUrl }
  } catch (e) {
    // TODO: revert something?
    return Promise.reject(e)
  }
}

const getPayment = async (txnId) => {
  try {
    const payment = await mollie.payments.get(txnId)
    if (!payment) throw { status: 404, msg: 'paymentNotFound' }
    return payment
  } catch (e) {
    return Promise.reject(e)
  }
}

module.exports = {
  createPayment,
  getPayment
}