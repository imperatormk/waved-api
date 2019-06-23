const router = require('express').Router()

const db = require(__basedir + '/db/controllers')
const registerService = require(__basedir + '/services/accounts').register
const authMiddleware = require(__basedir + '/services/auth').middleware

router.post('/register', (req, res, next) => {
  const user = req.body
  return registerService(user)
    .then(user => res.send(user))
    .catch(err => next(err))
})

router.get('/:id', authMiddleware, (req, res, next) => {
  const userId = req.params.id

  return db.users.getUserById(userId) // DRY!
    .then((user) => {
      if (!user) throw { status: 404, msg: 'userNotFound' }
      return res.send(user)
    })
    .catch(err => next(err))
})

module.exports = router