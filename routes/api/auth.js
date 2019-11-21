const router = require('express').Router()

const { authMiddleware, login } = require(__basedir + '/services/auth')

router.get('/user', authMiddleware, (req, res) => {
  return res.send(req.user)
})

router.post('/login', login)

module.exports = router