const passport = require('passport')

const middlewareFn = (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err) return next(err)
    if (!user) return next({ status: 401, msg: 'notAuth' })
    req.user = user
    next()
  })(req, res, next)
}

module.exports = middlewareFn