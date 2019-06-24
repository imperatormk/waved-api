const db = require(__basedir + '/db/controllers')

const middlewareFn = (req, res, next) => {
  const forbiddenStatus = { status: 403, msg: 'forbidden' }
  const userId = req.user && req.user.id

  if (!userId) return next(forbiddenStatus)
  db.users.isAdmin(userId)
    .then((isAdmin) => {
      if (!isAdmin) return next(forbiddenStatus)
      req.user.isAdmin = true
      next()
    })
}

module.exports = middlewareFn