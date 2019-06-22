const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const helpers = require(__basedir + '/helpers')

const exportsObj = {}

const changeTrackPitch = (filename, pitch) => {
  const directory = helpers.getStoragePath('tracks')
  const importPath = path.join(directory, filename)

  let ffpipe = ffmpeg()
  ffpipe.addInput(importPath)

  const complexFilter = []
  complexFilter.push(`[0:a]atempo=1[final]`)

  const implFilename = filename.split('.')
  const explFilename = `${implFilename[0]}_${pitch}.${implFilename[1]}`

  const exportPath = path.join(directory, explFilename)
  return new Promise((resolve, reject) => {
    ffpipe
      .complexFilter(complexFilter, 'final')
      .on('end', () => {
        resolve({ status: 'success', path: exportPath })
      })
      .on('error', (err) => {
        reject({ status: 500, msg: err.message })
      })
      .save(exportPath, helpers.getStoragePath('temp'))
  })
}

exportsObj.pitchifyTrack = (filename) => {
  const pitches = ['m2', 'm1', 0, 1, 2]
  const promises = pitches.map(pitch => changeTrackPitch(filename, pitch))
  
  return Promise.all(promises)
    .then(results => ({ results }))
}

module.exports = exportsObj