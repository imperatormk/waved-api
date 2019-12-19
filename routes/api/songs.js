const router = require('express').Router()

const db = require(__basedir + '/db/controllers')

const { uploadMiddleware, forgeSongSlug, parseBoolean } = require(__basedir + '/helpers')
const { adminMiddleware, authMiddleware } = require(__basedir + '/services/auth')

const services = require(__basedir + '/services')

router.get('/', (req, res, next) => {
  const { page, size, by, order } = req.query
  const { genres, instrument } = req.query
  const { unpublished, feed } = req.query

  const criteria = {}
  if (genres) criteria.genres = { tag: genres.split(',') }
  if (instrument) criteria.instrument = { type: instrument }
  if (parseBoolean(unpublished) !== true) criteria.published = true
  if (feed) criteria.feed = feed

  return db.songs.getSongs({ page, size, by, order }, criteria)
    .then(songs => res.send(songs))
    .catch(err => next(err))
})

router.get('/:field', (req, res, next) => {
  const fieldVal = req.params.field
  const idField = req.query.idFld || 'id'
  const pitch = req.query.pitch || 0

  const criteriaObj = {}
  criteriaObj[idField] = fieldVal

  return db.songs.getSong(criteriaObj)
    .then((result) => {
      if (!result) return next({ status: 404, msg: 'invalidSong' })
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

const uploadMwTracks = uploadMiddleware('tracks').fields(
  [{
    name: 'track', maxCount: 1
  }, {
    name: 'trackData'
  }]
)

const uploadMwThumbnails = uploadMiddleware('thumbnails').fields(
  [{
    name: 'thumbnail', maxCount: 1
  }]
)

router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  const song = req.body

  return db.songs.insertSong(song)
    .then((result) => {
      const { id, title, artist } = result
      const slug = forgeSongSlug([title, artist])
      return db.songs.updateSong({ id, slug })
    })
    .then(result => res.status(201).json(result))
    .catch(err => next(err))
})

router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) => {
  const song = req.body || {}
  const { id } = req.params
  const { title, artist } = song

  return db.songs.getSongById(id)
    .then((result) => {
      if (!result) throw { status: 400, msg: 'invalidSong' }

      song.id = id
      if (title && artist) {
        const slug = forgeSongSlug([title, artist])
        song.slug = slug
      }

      return db.songs.updateSong(song)
        .then(result => res.json(result))
    })
    .catch(err => next(err))
})

router.put('/:id/tracks', uploadMwTracks, (req, res, next) => {
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
      const { id } = result

      services.pitchifyTrack(url) // TODO: move this from here
        .then(() => {
          db.tracks.updateTrack({ id, status: 'READY' })
        })
        .catch((err) => { // TODO: log this
          console.log('error while inserting track:', err)
          db.tracks.updateTrack({ id, status: 'FAILED' })
        })

      return res.status(201).json({ id })
    })
    .catch(err => next(err))
})

router.put('/:id/thumbnail', uploadMwThumbnails, (req, res, next) => {
  const songId = req.params.id
  const files = req.files['thumbnail']
  if (!files.length) return next({ status: 400, msg: 'thumbnailMissing' })
  const thumbnailUrl = files[0].filename

  const updateObj = {
    id: songId,
    thumbnail: thumbnailUrl
  }
  
  return db.songs.updateSong(updateObj)
    .then((result) => {
      const { id, thumbnail } = result
      return res.status(201).json({ id, thumbnail })
    })
    .catch(err => next(err))
})

router.put('/:id/prepare', authMiddleware, (req, res, next) => {
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

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) => {
  const songId = req.params.id

  return db.songs.deleteSong(songId)
    .then(song => res.json(song))
    .catch(err => next(err))
})

router.delete('/:songId/tracks/:trackId', (req, res, next) => {
  const { songId, trackId } = req.params

  return db.songs.getSong({ id: songId })
    .then((result) => {
      if (!result) return next({ status: 404, msg: 'invalidSong' })
      const { tracks } = result
      if (tracks.length <= 1) return next({ status: 400, msg: 'cannotRemoveLastTrack' })

      return db.tracks.deleteTrack({ id: trackId, songId })
        .then(() => {
          res.json({ songId, trackId })
        })
        .catch(err => next(err))
    })
})

module.exports = router