const dotenv = require('dotenv')
dotenv.config()

const constants = {
  appStoragePath: process.env.APP_STORAGE_PATH,
  staticFilesPath: process.env.STATIC_FILES_PATH
}

module.exports = constants