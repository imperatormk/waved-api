const router = require('express').Router()
const path = require('path')
const fs = require('fs')

const db = require(__basedir + '/db/controllers')
const helpers = require(__basedir + '/helpers')
const processingService = require(__basedir + '/services/processing')
const authMiddleware = require(__basedir + '/services/auth').authMiddleware

router.get('/', authMiddleware, (req, res, next) => {
  const userId = req.user.id
  const { page, size, by, order } = req.query

  db.processings.getProcessings({ page, size, by, order }, userId)
    .then(processings => res.send(processings))
    .catch(err => next(err))
})

router.get('/:id/doit/', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id
  processingService.performProcessing(pcsId)
    .then((result) => {
      res.send(result)
    })
    .catch(err => next(err))
})

router.get('/:id/download/', authMiddleware, (req, res, next) => {
  const pcsId = req.params.id
  db.processings.getProcessingById(pcsId)
    .then((result) => {
      if (!result) return next({ status: 404, msg: 'notFound' })
      if (result.usrId !== req.user.id) return next({ status: 403, msg: 'inaccessible' })

      const { outputFilename } = result
      if (!outputFilename) return next({ status: 404, msg: 'notReady' })

      const directory = helpers.getStoragePath('tracks')
      const outputPath = path.join(directory, 'output', outputFilename)

      const exists = fs.existsSync(outputPath)
      if (exists) {
        res.set('Content-Disposition', `attachment;filename=${outputFilename}`)
        res.set('Content-Type', 'application/octet-stream')
        res.download(outputPath)
      } else {
        return next({ status: 404, msg: 'notFound' })
      }
    })
})

module.exports = router