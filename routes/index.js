const router = require('express').Router()

const apiRoutes = require('./api')
const errorHandler = require('./error-handler')

let startDate = new Date()

router.get('/', (req, res) => {
  return res.send({
    sane: true,
	  startDate
  })
})

router.use('/api', apiRoutes)
router.use(errorHandler)

module.exports = router