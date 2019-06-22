const router = require('express').Router()

const db = require(__basedir + '/db/controllers')
const uploadMiddleware = require(__basedir + '/helpers').uploadMiddleware
const services = require(__basedir + '/services')

router.get('/', (req, res, next) => {
  const pageData = { page: 1, size: 5 }

  return db.songs.getSongs(pageData)
    .then((songs) => {
      return res.send(songs)
    })
    .catch(err => next(err))
})

router.get('/:id', (req, res, next) => {
  const songId = req.params.id
  const pitch = req.query.pitch || 0

  return db.songs.getSongById(songId)
    .then((result) => {
      if (!result) return res.status(404).send({ msg: 'invalidSong' })
      const song = result

      const pitchedTracks = song.tracks.map((track) => {
        const explPath = track.url.split('.')
        const implPath = `${explPath[0]}_${pitch}.${explPath[1]}`

        return {
          ...track,
          url: implPath
        }
      })
      return res.send({
        ...song,
        tracks: pitchedTracks
      })
    })
    .catch(err => next(err))
})

const uploadMw = uploadMiddleware('tracks').fields(
  [{
    name: 'track', maxCount: 1
  }, {
    name: 'trackData'
  }]
)

router.post('/', (req, res) => {
  const song = req.body

  return db.songs.insertSong(song)
    .then(result => res.status(201).json(result))
})

router.post('/:id/tracks', uploadMw, (req, res, next) => {
  const songId = req.params.id

  const url = req.files['track'][0].filename
  const data = JSON.parse(req.body.metadata)
  const { instrument } = data
  
  const track = {
    songId,
    url,
    instrument
  }

  return db.tracks.insertTrack({ ...track, status: 'PREPARING' })
    .then(result => {
      const trackId = result.id

      services.pitchifyTrack(url) // TODO: move this from here
        .then(() => {
          db.tracks.updateTrack({ id: trackId, status: 'READY' })
        })
        .catch(() => { // TODO: log this
          db.tracks.updateTrack({ id: trackId, status: 'FAILED' })
        })

      return res.status(201).json({ id: trackId })
    })
    .catch(err => next(err))
})

module.exports = router