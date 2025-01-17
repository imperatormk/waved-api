const router = require('express').Router()
const path = require('path')
const fs = require('fs')

const db = require(__basedir + '/db/controllers')
const helpers = require(__basedir + '/helpers')
const { authMiddleware } = require(__basedir + '/services/auth')
const processingService = require(__basedir + '/services/processing')
const paymentsService = require(__basedir + '/services/payments') // TODO: maybe move sometimes
const mailerService = require(__basedir + '/services/mailer')

const validateProcessing = ({ pcsId, txnId }) => { // service/helper?
  return db.processings.getProcessingById(pcsId, { include: ['order', 'song', 'buyer'] })
    .then((processing) => {
      if (!processing || !processing.order) throw { status: 400, msg: 'badProcessing' }
      if (processing.status !== 'PENDING') throw { status: 400, msg: 'badProcessing' }
      if (processing.order.txnId !== txnId) throw { status: 400, msg: 'badTransaction' }

      return processing
    })
}

const validatePayment = ({ ordId, txnId }) => { // service/helper?
  return paymentsService.getPayment(txnId)
    .then(async (payment) => {
      if (!payment) throw { status: 204, msg: 'badTransaction' }

      const { status, isFailed } = payment
      if (!isFailed) {
        await db.orders.updateOrder({
          id: ordId,
          status
        })
      } else {
        // defer this a bit so it can still be read from the post order UI page
        setTimeout(() => {
          db.orders.deleteOrder(ordId)
        }, 30 * 1000)
      }

      return status
    })
}

router.get('/', authMiddleware, (req, res, next) => {
  const userId = req.user.id
  const { page, size, by, order } = req.query

  db.processings.getProcessings({ page, size, by, order }, userId)
    .then(processings => res.send(processings))
    .catch(err => next(err))
})

router.get('/:id', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id
  const { order_status } = req.query

  db.processings.getProcessingById(pcsId, { include: ['order'] })
    .then((processing) => {
      if (!processing) throw { status: 404, msg: 'notFound' }
      if (!processing.order) throw { status: 404, msg: 'notFound' }
      if (processing.usrId !== req.user.id) throw { status: 404, msg: 'notFound' }

      return processing.toJSON()
    })
    .then((processing) => {
      if (!order_status) return processing

      const { id: ordId, txnId, createdAt } = processing.order
      return validatePayment({ ordId, txnId })
        .then((status) => {
          return { ...processing, order: { status, createdAt } }
        })
    })
    .then(result => res.send(result))
    .catch(err => next(err))
})

router.get('/:id/order', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id

  db.processings.getProcessingById(pcsId, { include: ['order'] })
    .then((processing) => {
      if (!processing) throw { status: 400, msg: 'badProcessing' }
      if (processing.status !== 'PENDING') throw { status: 400, msg: 'badProcessing' }
      if (processing.usrId !== req.user.id) throw { status: 400, msg: 'badProcessing' }

      return processing
    })
    .then(processing => processingService.orderProcessing(processing))
    .then(result => res.send(result))
    .catch(err => next(err))
})

// this should be mollie webhook endpoint url; (TODO) move to payments maybe?
router.post('/:id/paymentupdate', (req, res, next) => {
  const pcsId = req.params.id
  const txnId = req.body.id

  if (!pcsId || !txnId) return next({ status: 400, msg: 'emptyBody' })

  validateProcessing({ pcsId, txnId })
    .then((processing) => {
      const { buyer, song } = processing

      return validatePayment({ ordId: processing.order.id, txnId })
        .then((status) => {
          if (status === 'paid') {
            processingService.performProcessing(pcsId)
    
            const { username, email } = buyer
            const { title, artist } = song
            const songObj = { title, artist }
    
            mailerService.sendOrderConfirmationEmail(email, { username, song: songObj })
          }
          return res.send({ status: 'success' })
        })
    })
    .catch(err => next(err))
})

router.get('/:id/download', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id
  db.processings.getProcessingById(pcsId)
    .then((result) => {
      if (!result) throw { status: 400, msg: 'badProcessing' }
      if (result.usrId !== req.user.id) throw { status: 400, msg: 'badProcessing' }

      const { outputFilename } = result
      if (!outputFilename) throw { status: 412, msg: 'notReady' }
      return outputFilename
    })
    .then((outputFilename) => {
      const directory = helpers.getStoragePath('tracks')
      const outputPath = path.join(directory, 'output', outputFilename)

      const exists = fs.existsSync(outputPath)
      if (exists) {
        res.set('Content-Disposition', `attachment;filename=${outputFilename}`)
        res.set('Content-Type', 'application/octet-stream')
        res.download(outputPath)
        return
      }
      throw { status: 404, msg: 'notFound' }
    })
    .catch(err => next(err))
})

module.exports = router