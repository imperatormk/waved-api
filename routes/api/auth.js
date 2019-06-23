const router = require('express').Router()

const authMiddleware = require(__basedir + '/services/auth').middleware
const login = require(__basedir + '/services/auth').login

router.get('/user', authMiddleware, (req, res) => {
  return res.send(req.user)
})

router.post('/login', login)

module.exports = router