const router = require('express').Router()

const db = require(__basedir + '/db/controllers')
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

module.exports = router