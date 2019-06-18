const router = require('express').Router()

const fs = require('fs')
const db = require(__basedir + '/db/controllers')

var multer  = require('multer')
var upload = multer({ dest: 'files/' })

router.get('/', (req, res, next) => {
  const pageData = { page: 1, size: 5 }

  return db.getSongs(pageData)
    .then((songs) => {
      return res.send(songs)
    })
    .catch(err => next(err))
})

router.get('/:id', (req, res) => {
  const songId = req.params.id
  const pitch = req.query.pitch || 0

  return db.songs.getSongById(songId)
    .then((result) => {
      if (!result) return res.status(404).send({ msg: 'invalidSong' })
      const song = result.toJSON()

      const pitchedTracks = song.tracks.map((track) => {
        return {
          ...track,
          url: `${track.url}_${pitch}`
        }
      })
      return res.send({
        ...song,
        tracks: pitchedTracks
      })
    })
    .catch(err => next(err))
})

router.get('/:id/tracks/:audioName', (req, res) => {
  const audioName = req.params.audioName.trim()
  const audioPath = `${__basedir}/files/${audioName}.mp3`

  fs.access(audioPath, fs.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ msg: 'invalidTrack' })
    }
    return res.sendFile(audioPath)
  })
})

const uploadMw = upload.fields([{ name: 'tracks', maxCount: 10 }, { name: 'data' }])
router.post('/', uploadMw, (req, res) => {
  const data = JSON.parse(req.body.data)
  const { song, tracks } = data
  res.send({ song, tracks })
})

module.exports = router