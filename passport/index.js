const jwtSecret = require('./config/jwtConfig')

const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const extractJWT = require('passport-jwt').ExtractJwt

const db = require(__basedir + '/db/controllers')

passport.use('login', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false
}, (username, password, next) => {
  return db.users.getUser({ username }, true)
    .then((user) => {
      if (!user) return next(null, false, { status: 400, msg: 'badUsername' })
      return bcrypt.compare(password, user.password)
        .then((response) => {
          if (!response) return next(null, false, { status: 400, msg: 'badPassword' })
          return next(null, user.toJSON())
        })
    })
    .catch(err => next(err))
}))

const opts = {
  jwtFromRequest: extractJWT.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtSecret.secret
}

passport.use('jwt', new JwtStrategy(opts, (jwtPayload, next) => {
  return db.users.getUser({ username: jwtPayload.username })
    .then((user) => {
      if (user) { next(null, user) }
      else { next(null, false) }
    })
    .catch((err) => {
      next(err)
    })
}))

passport.serializeUser((user, next) => {
  next(null, user)
})

passport.deserializeUser((user, next) => {
  next(null, user)
})