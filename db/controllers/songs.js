const exportsObj = {}

const Song = require('../models').song
const Genre = require('../models').genre
const Track = require('../models').track
const GenresSongs = require('../models').genresSongs
const Processing = require('../models').processing
const sequelize = require('../models').sequelize

const getPagination = (pageData = {}) => {
  const limit = pageData.size || 100
	const page = pageData.page || 1
	const by = pageData.by || 'id'
	const order = pageData.order || 'ASC'
	
	const options = {
    limit,
    offset: limit * (page - 1),
		order: [[by, order]],
  }
  return options
}

const appendSongStatus = (songObj) => {
	if (!songObj) return null
	const song = songObj.toJSON()
	
	const { tracks } = song
	const hasPreparing = tracks.find(track => track.status === 'PREPARING')
	const hasFailed = tracks.find(track => track.status === 'FAILED') || tracks.length === 0
	const status = hasFailed ? 'FAILED' : hasPreparing ? 'PREPARING' : 'READY'

	return {
		...song,
		status
	}
}

const getBestSellers = (count) => {
  if (!count) throw { status: 'badParams' }

  return Processing.findAll({
    group: ['songId'],
    where: {
      status: 'READY'
    },
    attributes: ['songId', [sequelize.fn('COUNT', 'songId'), 'pcsCount']],
    order: [['pcsCount', 'DESC']],
    limit: count
  })
    .then((results) => {
      const songIds = results.map(item => item.songId)
      return songIds
    })
}

exportsObj.getSongs = (pageData, criteria = {}) => {
	// flimsy
	const trackInclude = {
		model: Track,
		as: 'tracks'
  }
  const genreInclude = {
    model: Genre,
    as: 'genres',
    through: { attributes: [] }
  }

  const { instrument, genres, feed, archived } = criteria
  const pagination = getPagination(pageData)

  if (archived) {
    if (archived === 'all') {
      delete criteria.archived
    }
  } else {
    criteria.archived = false
  }

  if (feed === 'latest') {
    pageData.by = 'id'
    pageData.order = 'DESC'
  } else if (feed === 'archive') {
    criteria.archived = true
  } else if (feed === 'bestsellers') {
    // !TODO: implement
    getBestSellers(pagination.limit)
      .then((bestIds) => {
        console.log(bestIds)
      })
  }
  delete criteria.feed

	if (instrument) {
		delete criteria.instrument
		trackInclude.where = { instrument } // works a bit magically tbh
  }

  if (genres) {
		delete criteria.genres
		genreInclude.where = genres
  }
  
  const options = {
		where: criteria,
		include: [
      trackInclude,
      genreInclude
    ],
		...pagination,
  }
	return Song.findAll(options)
		.then(songs => songs.map(appendSongStatus))
		.then((songs) => songs.map((song) => {
			delete song.tracks
			return song
		}))
		.then((songs) => {
			return Song.findAll({
        where: options.where || {},
        include: options.include || [],
        attributes: ['id']
      })
				.then((countArr) => ({
					totalElements: countArr.length,
					content: songs
				}))
		})
}

exportsObj.getSong = (song) => {
  const trackInclude = {
    model: Track,
    as: 'tracks'
  }
  const genreInclude = {
    model: Genre,
    as: 'genres',
    through: { attributes: [] }
  }

	const options = {
		where: song,
    include: [
      trackInclude,
      genreInclude
    ]
  }
	return Song.findOne(options)
		.then(appendSongStatus)
}

exportsObj.getSongById = (songId) => {
	const criteria = { id: songId }
	return exportsObj.getSong(criteria)
}

exportsObj.getSongsByGenre = (pageData, genreTags) => {
	const criteria = { genres: { tag: genreTags } }
	return exportsObj.getSongs(pageData, criteria)
}

exportsObj.insertSong = async (song) => {
	const { genres } = song
	if (!genres || !genres.length)
    return Promise.reject({ msg: 'genresEmpty' })

  const genresP = genres.map(async (genreId) => {
    const genre = await Genre.findOne({ where: { id: genreId } })
    if (genre) {
      const genreObj = genre.toJSON()
      return genreObj.id
    }
    return { invalidGenre: genreId }
  })
  const genresArr = await Promise.all(genresP)
  
  const invalidGenres = genresArr.filter(item => !!item.invalidGenre)
  if (invalidGenres.length) {
    const invalidGenreIds = invalidGenres.map(item => item.invalidGenre)
    return Promise.reject({ msg: 'invalidGenres', details: [invalidGenreIds] })
  }

  const transactionP = sequelize.transaction((t) => {
    return Song
      .create(song, { transaction: t })
      .then((insSong) => {
        const { id } = insSong
        const genresSongs =
          genresArr.map((genreId) => ({
            songId: id,
            genreId: genreId
          }))
        return {
          songId: id,
          genresSongs
        }
      })
      .then(({ songId, genresSongs }) => {
        return GenresSongs.bulkCreate(genresSongs, { transaction: t })
          .then(() => songId)
      })
  })

  return transactionP
    .then(songId => exportsObj.getSongById(songId))
}

exportsObj.updateSong = (song) => {
	const options = {
		where: { id: song.id }
	}
  return Song.update(song, options)
    .then(() => exportsObj.getSongById(song.id))
}

exportsObj.deleteSong = (songId) => {
	const options = {
		where: { id: songId }
	}
	return Song.destroy(options)
	  .then(() => ({ id: songId }))
}

module.exports = exportsObj