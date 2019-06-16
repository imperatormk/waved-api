const displayFullErrors = !!process.env.DISPLAY_ALL_ERRORS

module.exports = (err, req, res, next) => {
  if (!err) return next()
  // TODO: add logger
  const status = err.status || err.statusCode || 500
  const body = {
    msg: err.msg || err.message || err || 'unknownError',
    details: err.details,
  }
  if (displayFullErrors) body.all = err
  return res.status(status).send(body)
}