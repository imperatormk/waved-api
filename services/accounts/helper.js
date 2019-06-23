const exportsObj = {}

const bcrypt = require('bcrypt')
const BCRYPT_SALT_ROUNDS = 12

exportsObj.hashPassword = (password) => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
}

module.exports = exportsObj