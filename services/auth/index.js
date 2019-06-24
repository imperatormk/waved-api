const exportsObj = {}

exportsObj.login = require('./login')
exportsObj.authMiddleware = require('./authMiddleware')
exportsObj.adminMiddleware = require('./adminMiddleware')

module.exports = exportsObj