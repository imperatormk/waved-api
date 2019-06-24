const exportsObj = {}

const Song = require('../models').song
const Track = require('../models').track

const getPagination = (pageData) => {
  const limit = pageData.size || 100
	const page = pageData.page || 1
	
	const options = {
    limit,
    offset: limit * (page - 1)
  }
  return options
}

const appendSongStatus = (songObj) => {
	if (!songObj) return null
	const song = songObj.toJSON()
	
	const { tracks } = song
	const hasPreparing = tracks.find(track => track.status === 'PREPARING')
	const hasFailed = tracks.find(track => track.status === 'FAILED')
	const status = hasFailed ? 'FAILED' : hasPreparing ? 'PREPARING' : 'READY'

	return {
		...song,
		status
	}
}

exportsObj.getSongs = (pageData) => {
  const options = {
		...getPagination(pageData),
		include: [{
      model: Track,
      as: 'tracks'
    }]
  }
	return Song.findAll(options)
		.then(songs => songs.map(appendSongStatus))
		.then((songs) => {
			return Song.count()
				.then(count => ({
					totalElements: count,
					content: songs
				}))
		})
}

exportsObj.getSongById = (songId) => {
	const options = {
		where: { id: songId },
    include: [{
      model: Track,
      as: 'tracks'
    }]
	}
	return Song.findOne(options)
		.then(appendSongStatus)
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