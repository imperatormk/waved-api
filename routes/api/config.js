const router = require('express').Router()

const db = require(__basedir + '/db/controllers')
const { adminMiddleware, authMiddleware } = require(__basedir + '/services/auth')
const { uploadMiddleware } = require(__basedir + '/helpers')

router.get('/', (req, res, next) => {
  const objectify = (config) => {
    const obj = {}
      config.forEach((configObj) => {
      obj[configObj.key] = configObj.value
    })
    return Promise.resolve(obj)
  }

  db.config.getConfig()
    // .then(config => objectify(config))
    .then(config => res.json(config))
    .catch(err => next(err))
})

router.get('/:key', (req, res, next) => {
  const { key } = req.params
  db.config.getConfigByKey(key)
    .then((config) => {
      if (!config) throw { status: 404, msg: 'notFound' }
      return res.json(config)
    })
    .catch(err => next(err))
})

router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  const configObj = req.body
  const verifyParams = new Promise((resolve, reject) => {
    if (!configObj || !configObj.key || !configObj.value) {
      reject({ status: 400, msg: 'badConfig' })
      return
    }
    resolve(configObj)
  })

  return verifyParams
    .then(configObj => db.config.upsertConfig(configObj))
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(err => next(err))
})

const uploadMwLogo = uploadMiddleware('system').fields(
  [{
    name: 'logo', maxCount: 1
  }]
)

router.post('/logo', uploadMwLogo, (req, res, next) => {
  const logoUrl = req.files['logo'][0].filename
  const verifyParams = new Promise((resolve, reject) => {
    if (!logoUrl) {
      reject({ status: 400, msg: 'badConfig' })
      return
    }
    const configObj = {
      key: 'LOGO',
      value: logoUrl
    }
    resolve(configObj)
  })
  
  return verifyParams
    .then(configObj => db.config.upsertConfig(configObj))
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(err => next(err))
})

module.exports = router