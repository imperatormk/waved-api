const jwt = require('jsonwebtoken')
const passport = require('passport')

const jwtSecret = require(__basedir + '/passport/config/jwtConfig')
const db = require(__basedir + '/db/controllers')

const loginFn = (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) return next(err)
    if (info) return next(info)
    return req.logIn(user, (err) => {
      if (err) return next(err)

      const userId = user.id
      const getUserFn = db.users.getUser({ id: userId })
      const isAdminFn = db.users.isAdmin(userId)

      return Promise.all([getUserFn, isAdminFn])
        .then(([user, isAdmin]) => {
          const userObj = user.toJSON()
          const token = jwt.sign({ username: user.username }, jwtSecret.secret)

          return res.send({ token, user: { ...userObj, isAdmin } })
        })
    })
  })(req, res, next)
}

module.exports = loginFn
