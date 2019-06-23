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
      return db.users.getUser({ id: user.id })
        .then((user) => {
          const token = jwt.sign({ username: user.username }, jwtSecret.secret)
          return res.send({ token })
        })
    })
  })(req, res, next)
}

module.exports = loginFn