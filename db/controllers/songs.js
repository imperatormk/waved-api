const exportsObj = {}

const Song = require('../models').song
const Track = require('../models').track

exportsObj.getSongs = () => {
	return Song.findAll()
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