const exportsObj = {}

const path = require('path')
const constants = require('../config/constants')

const multer  = require('multer')
const crypto = require('crypto')
const mime = require('mime')

// upload fns

const upload = (subFolder) => {
  if (!subFolder) throw { status: 'subfolder_missing' }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const storagePath = getStoragePath(subFolder)
      cb(null, storagePath)
    },
    filename: (req, file, cb) => {
      crypto.pseudoRandomBytes(16, (err, raw) => {
        cb(null, `${raw.toString('hex')}-${Date.now()}.${mime.getExtension(file.mimetype)}`)
      })
    }
  })

  return multer({
    storage: storage,
    limits: {
      fieldSize: 4194304
    }
  })
}
exportsObj.uploadMiddleware = upload

// storage utils

const getStoragePath = (key) => {
  const baseStoragePath = constants.appStoragePath
  return path.join(baseStoragePath, key)
}
exportsObj.getStoragePath = getStoragePath

const getStorageUrl = (key, filename) => {
  const storagePath = getStoragePath(key)
  return path.join(storagePath, filename)
}
exportsObj.getStorageUrl = getStorageUrl

// static files utils

const getStaticFilesPath = (key) => {
  const baseStaticFilesPath = constants.staticFilesPath
  return path.join(baseStaticFilesPath, key)
}
exportsObj.getStaticFilesPath = getStaticFilesPath

const getStaticFilesUrl = (key, filename) => {
  const staticFilesPath = getStaticFilesPath(key)
  return path.join(staticFilesPath, filename)
}
exportsObj.getStaticFilesUrl = getStaticFilesUrl

module.exports = exportsObj