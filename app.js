const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const routes = require('./routes')

const app = express()

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', routes)

const ffmpeg = require('fluent-ffmpeg')

app.post('/api/audio/:id', (req, res) => {
  const { tracks, opts } = req.body
  let ffpipe = ffmpeg()
  const complexFilter = []
  let allTracks = ''
  //
  tracks.forEach((track, idx) => {
    const url = `${__basedir}/files/${track.url}.mp3`
    ffpipe = ffpipe.addInput(url)
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
  
  const exportName = `${__basedir}/files/output/test.mp3`
  ffpipe
    .complexFilter(complexFilter, 'final')
    .on('end', () => {
      res.send({ status: 'success', export: exportName })
    })
    .on('error', (err) => {
      res.status(500).send(err.message)
    })
    .save(exportName, `${__basedir}/files/temp`)
})

module.exports = app