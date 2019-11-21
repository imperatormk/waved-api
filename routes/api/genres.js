const router = require('express').Router()

const db = require(__basedir + '/db/controllers')

const { adminMiddleware, authMiddleware } = require(__basedir + '/services/auth')

const replaceString = require('replace-string')

router.get('/', (req, res, next) => {
  return db.genres.getGenres()
    .then(genres => res.json(genres))
    .catch(err => next(err))
})

router.get('/:tag', (req, res, next) => {
  const genreTag = req.params.tag
  const genreCriteria = [genreTag]

  return db.songs.getSongsByGenre(undefined, genreCriteria)
    .then(result => res.json(result))
    .catch(err => next(err))
})

router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  const generateTag = (genreName) => { // TODO: move to helpers?
    const chars = ['-', `'`, '/']
    let escapedString = genreName
    chars.forEach((char) => {
      escapedString = replaceString((escapedString), char, ' ')
    })
  
    const tag = escapedString
      .replace(/ +/g, '-')
      .toLowerCase()
    return tag
  }

  const genre = req.body
  const tag = generateTag(genre.name)
  genre.tag = tag

  return db.genres.insertGenre(genre)
    .then(result => res.status(201).json(result))
    .catch(err => next(err))
})

router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) => {
  const genreId = req.params.id

  return db.genres.deleteGenre(genreId)
    .then(() => res.json({ status: 'success' }))
})

module.exports = router