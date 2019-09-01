const router = require('express').Router()
const path = require('path')
const fs = require('fs')

const db = require(__basedir + '/db/controllers')
const helpers = require(__basedir + '/helpers')
const authMiddleware = require(__basedir + '/services/auth').authMiddleware
const processingService = require(__basedir + '/services/processing')
const paymentsService = require(__basedir + '/services/payments') // TODO: maybe move sometimes

router.get('/', authMiddleware, (req, res, next) => {
  const userId = req.user.id
  const { page, size, by, order } = req.query

  db.processings.getProcessings({ page, size, by, order }, userId)
    .then(processings => res.send(processings))
    .catch(err => next(err))
})

router.get('/:id/order/', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id

  db.processings.getProcessingById(pcsId)
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

// this should be webhook endpoint url
router.post('/:id/perform/', (req, res, next) => {
  const pcsId = req.params.id
  const txnId = req.body.id

  if (!pcsId || !txnId) return next({ status: 400, msg: 'emptyBody' })

  db.processings.getProcessingById(pcsId)
    .then((processing) => {
      if (!processing || !processing.order) throw { status: 400, msg: 'badProcessing' }
      if (processing.status !== 'PENDING') throw { status: 400, msg: 'badProcessing' }
      if (processing.order.txnId !== txnId) throw { status: 400, msg: 'badTransaction' }

      return processing
    })
    .then((processing) => {
      return paymentsService.getPayment(txnId)
        .then((payment) => {
          if (!payment) throw { status: 400, msg: 'badTransaction' }
          const { status } = payment
          return { processing, status }
        })
    })
    .then(({ processing, status }) => {
      return db.orders.updateOrder({
        id: processing.order.id,
        status
      })
        .then(() => ({ processing, status }))
    })
    .then(({ processing, status }) => {
      if (status === 'paid') {
        processingService.performProcessing(processing.id)
          .then(() => {}) // TODO: log this?
      }

      return res.status(200).send({ status: 'success' })
    })
    .catch(err => next(err))
})

router.get('/:id/download/', authMiddleware, (req, res, next) => {
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