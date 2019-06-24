const router = require('express').Router()

const accountsRoutes = require('./accounts')
const authRoutes = require('./auth')
const songsRoutes = require('./songs')

const processingService = require(__basedir + '/services/processing')

const checkEmptyBody = (req, res, next) => {
	const body = req.body
	if (!body || Object.keys(body).length === 0) {
    return next({ status: 400, msg: 'emptyBody' })
  }
	next()
}

const convertToNumbers = (req, res, next) => {
  const params = req.params
  Object.keys(params).forEach((paramKey) => {
  	if (!isNan(params[paramKey])) {
      req.params[paramKey] = Number(params[paramKey])
    }
  })
  next()
}
router.use(convertToNumbers) // doesn't work atm

router.use('/accounts', accountsRoutes)
router.use('/auth', authRoutes)
router.use('/songs', songsRoutes)

// temp
router.get('/processings/:id/doit/', (req, res, next) => {
  const pcsId = req.params.id
  processingService.performProcessing(pcsId)
    .then((result) => {
      res.send(result)
    })
    .catch(err => next(err))
})

module.exports = router