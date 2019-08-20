const router = require('express').Router()

const db = require(__basedir + '/db/controllers')

const uploadMiddleware = require(__basedir + '/helpers').uploadMiddleware
const authMiddleware = require(__basedir + '/services/auth').authMiddleware
const adminMiddleware = require(__basedir + '/services/auth').adminMiddleware

const services = require(__basedir + '/services')

router.get('/', (req, res, next) => {
  const { page, size, by, order } = req.query
  const { genre, instrument } = req.query

  const criteria = {}
  if (genre) criteria.genre = genre
  if (instrument) criteria.instrument = instrument

  return db.songs.getSongs({ page, size, by, order }, criteria)
    .then(songs => res.send(songs))
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

router.post('/', authMiddleware, adminMiddleware, (req, res) => {
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
    .then((result) => {
      const { id, songId } = result

      services.pitchifyTrack(url) // TODO: move this from here
        .then(({ results }) => {
          db.tracks.updateTrack({ id, status: 'READY' })

          const { duration } = results[0] // ym okay
          db.songs.updateSong({
            id: songId,
            duration
          })
        })
        .catch(() => { // TODO: log this
          db.tracks.updateTrack({ id, status: 'FAILED' })
        })

      return res.status(201).json({ id })
    })
    .catch(err => next(err))
})

router.post('/:id/prepare', authMiddleware, (req, res, next) => {
  const userId = req.user.id
  const songId = req.params.id
  const config = req.body

  return db.songs.getSongById(songId)
    .then((song) => {
      if (!song) throw { status: 404, msg: 'songNotFound' }
      const processing = {
        config: JSON.stringify(config),
        status: 'PENDING',
        songId,
        usrId: userId
      }
      return db.processings.insertProcessing(processing)
        .then((result) => res.json({ id: result.id }))
    })
    .catch(err => next(err))
})

module.exports = router