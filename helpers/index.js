const exportsObj = {}

const fs = require('fs')
const path = require('path')
const constants = require('../config/constants')

const multer  = require('multer')
const crypto = require('crypto')
const mime = require('mime')

// upload fns

const upload = (subFolder) => {
  if (!subFolder) throw { msg: 'subfolderMissing' }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const storagePath = getStoragePath(subFolder)
        cb(null, storagePath)
      }
      catch(err) {
        cb(err, null)
      }
    },
    filename: (req, file, cb) => {
      crypto.pseudoRandomBytes(16, (err, raw) => {
        let ext = mime.getExtension(file.mimetype)
        if (ext === 'mpga') ext = 'mp3'
        cb(null, `${raw.toString('hex')}-${Date.now()}.${ext}`)
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
  const storagePath = path.join(baseStoragePath, key)

  const exists = fs.existsSync(storagePath)
  if (!exists)
    throw { msg: 'invalidPath', details: storagePath }

  return storagePath
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

const forgeSongSlug = (parts) => {
  const cleanUpSpecialChars = (str) => {
    return str
      .replace(/[ÀÁÂÃÄÅàáâãäå]/g, 'a')
      .replace(/[ÈÉÊË]/g, 'e')
      .replace(/[Ññ]/g, 'n')
      .replace(/[^a-z0-9]/gi, '')
  }

  const words = []
  parts.forEach((part) => {
    words.push(...part.split(' '))
  })

  const slug = words
    .map(word => cleanUpSpecialChars(word))
    .join('-')
  return slug.toLowerCase()
}
exportsObj.forgeSongSlug = forgeSongSlug

const parseBoolean = (val) => {
  if (!val) return false
  const validBooleans = ['false', 'true']
  if (!validBooleans.includes(val)) return false
  return JSON.parse(val)
}
exportsObj.parseBoolean = parseBoolean

module.exports = exportsObj