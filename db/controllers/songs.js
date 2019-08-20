const exportsObj = {}

const Song = require('../models').song
const Track = require('../models').track

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

exportsObj.getSongs = (pageData, criteria = {}) => {
	// flimsy
	const includeObj = {
		model: Track,
		as: 'tracks'
	}

	const { instrument } = criteria
	if (instrument) {
		delete criteria.instrument
		includeObj.where = {
			instrument: instrument
		}
	}

  const options = {
		where: criteria,
		include: [includeObj],
		...getPagination(pageData),
  }
	return Song.findAll(options)
		.then(songs => songs.map(appendSongStatus))
		.then((songs) => songs.map((song) => {
			delete song.tracks
			return song
		}))
		.then((songs) => {
			return Song.count({ where: options.where || {} })
				.then((count) => ({
					totalElements: count,
					content: songs
				}))
		})
}

exportsObj.getSong = (song) => {
	const options = {
		where: song,
    include: [{
      model: Track,
      as: 'tracks'
    }]
	}
	return Song.findOne(options)
		.then(appendSongStatus)
}

exportsObj.getSongById = (songId) => {
	const criteria = { id: songId }
	return exportsObj.getSong(criteria)
}

exportsObj.insertSong = (song) => {
	return Song
		.create(song)
		.then(song => exportsObj.getSongById(song.id))
}

exportsObj.updateSong = (song) => {
	const options = {
		where: { id: song.id }
	}
	return Song.update(song, options)
}

exportsObj.deleteSong = (songId) => {
	const options = {
		where: { id: songId }
	}
	return Song.destroy(options)
	  .then(() => ({ id: songId }))
}

module.exports = exportsObj