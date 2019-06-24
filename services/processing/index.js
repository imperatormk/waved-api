const exportsObj = {}

const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const db = require(__basedir + '/db/controllers')
const helpers = require(__basedir + '/helpers')

const performProcessing = (id, config) => {
  const { tracks, opts } = config

  let ffpipe = ffmpeg()
  const complexFilter = []
  let allTracks = ''
  
  const directory = helpers.getStoragePath('tracks')
  let ext = '.mp3' // TODO: flimsy
  //
  tracks.forEach((track, idx) => {
    const filename = track.url
    const importPath = path.join(directory, filename)

    // TODO: flimsy
    const trackExt = filename.split('.')[1]
    if (trackExt) ext = trackExt

    ffpipe = ffpipe.addInput(importPath)
    // panning
    const panning = Number(track.panning)
    const l = panning <= 0 ? Math.abs(panning) + 1 : 1 - panning
    const r = panning >= 0 ? panning + 1 : 1 - Math.abs(panning)
    complexFilter.push(`[${idx}:a]pan=stereo|c0=${l}*c0|c1=${r}*c1[panned${idx}]`)
    // volume
    const { volume } = track
    complexFilter.push(`[panned${idx}]volume=${volume}[volumed${idx}]`)
    allTracks += `[volumed${idx}]`
  })
  // merge
  complexFilter.push(`${allTracks}amix=inputs=${tracks.length}[merged]`)
  // tempo
  complexFilter.push(`[merged]atempo=${opts.tempo}[final]`)
  
  const exportFilename = `processed_${id}.${ext}`
  const exportPath = path.join(directory, 'output', exportFilename)

  return new Promise((resolve, reject) => {
    ffpipe
      .complexFilter(complexFilter, 'final')
      .on('end', () => {
        resolve({ status: 'success', filename: exportFilename })
      })
      .on('error', (err) => {
        reject({ status: 500, msg: err.message })
      })
      .save(exportPath, helpers.getStoragePath('temp'))
  })
}

exportsObj.performProcessing = (pcsId) => { // this is more of a controller instead of a service
  return db.processings.getProcessingById(pcsId)
    .then((processing) => {
      if (!processing) throw { status: 404, msg: 'processingNotFound' }
      // if (!processing.orderId) throw { status: 402, msg: 'notYetOrdered' }
      if (processing.status !== 'PENDING') throw { status: 410, msg: 'notProcessable' }
      return processing.toJSON()
    })
    .then((processing) => {
      const preparingProcessing = { id: processing.id, status: 'PREPARING' }
      return db.processings.updateProcessing(preparingProcessing)
        .then(() => {
          const config = JSON.parse(processing.config)
          return performProcessing(pcsId, config)
            .then((result) => {
              const readyProcessing = { id: processing.id, status: 'READY', outputFilename: result.filename }
              return db.processings.updateProcessing(readyProcessing)
                .then(() => result)
            })
            .catch((err) => {
              const failedProcessing = { id: processing.id, status: 'FAILED' }
              return db.processings.updateProcessing(failedProcessing)
                .then(() => Promise.reject(err))
            })
        })
    })
}

module.exports = exportsObj