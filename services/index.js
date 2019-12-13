const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const helpers = require(__basedir + '/helpers')

const exportsObj = {}

const changeTrackPitch = (filename, pitch) => { // TODO: move this to processing service
  const directory = helpers.getStoragePath('tracks')
  const importPath = path.join(directory, filename)

  let ffpipe = ffmpeg()
  ffpipe.addInput(importPath)

  let pitchVal = null
  if (!isNaN(Number(pitch))) {
    pitchVal = Number(pitch)
  } else if (pitch.includes('m')) {
    pitchVal = Number(pitch.replace('m', '')) * -1
  }
  if (isNaN(pitchVal)) throw { status: 400, msg: 'invalidPitch' }

  const rate = 44100
  const coef = 5.946 / 100
  const mult = 1 + (coef*pitchVal)
  const tempo = 1 - (coef*pitchVal)

  const complexFilter = []
  complexFilter.push(`[0:a]asetrate=${rate}*${mult},aresample=${rate},atempo=${tempo}[final]`)

  const implFilename = filename.split('.')
  const explFilename = `${implFilename[0]}_${pitch}.${implFilename[1]}`

  const exportPath = path.join(directory, explFilename)
  return new Promise((resolve, reject) => {
    ffpipe
      .complexFilter(complexFilter, 'final')
      .on('end', () => {
        resolve({
          status: 'success',
          path: exportPath,
        })
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