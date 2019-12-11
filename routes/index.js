const express = require('express')
const router = express.Router()

const apiRoutes = require('./api')
const errorHandler = require('./error-handler')

const helpers = require(__basedir + '/helpers')

let startDate = new Date()

router.get('/', (req, res) => {
  return res.send({
    sane: true,
	  startDate
  })
})

const staticFiles = ['tracks', 'thumbnails', 'system']
staticFiles.forEach((staticFile) => {
  const staticPath = helpers.getStaticFilesPath(staticFile)
  const storagePath = helpers.getStoragePath(staticFile)

  router.use(staticPath, express.static(storagePath))
})

router.use('/api', apiRoutes)
router.use(errorHandler)

module.exports = router