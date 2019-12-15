const router = require('express').Router()

const db = require(__basedir + '/db/controllers')
const { register, update } = require(__basedir + '/services/accounts')
const { authMiddleware } = require(__basedir + '/services/auth')

router.post('/register', (req, res, next) => {
  const user = req.body
  return register(user)
    .then(user => res.send(user))
    .catch(err => next(err))
})

router.post('/update', authMiddleware, (req, res, next) => {
  const userId = req.user.id
  const {
    email, password, confirmPassword
  } = req.body
  const userObj = {
    email, password, confirmPassword
  }

  return db.users.getUserById(userId) // use as template for avoiding DRY
    .then((user) => {
      if (!user) throw { status: 404, msg: 'userNotFound' }

      userObj.username = user.username
      return update(userObj, userId)
        .then((result) => res.json(result))
    })
    .catch(err => next(err))
})

router.get('/:id', authMiddleware, (req, res, next) => {
  const userId = req.params.id
  return db.users.getUserById(userId) // use as template for avoiding DRY
    .then((user) => {
      if (!user) throw { status: 404, msg: 'userNotFound' }
      return res.send(user)
    })
    .catch(err => next(err))
})

module.exports = router