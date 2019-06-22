const exportsObj = {}

const Track = require('../models').track

exportsObj.getTrackById = (trackId) => {
	const options = {
		where: { id: trackId }
	}
	return Track.findOne(options)
}

exportsObj.insertTrack = (track) => {
	return Track
		.create(track)
		.then(track => exportsObj.getTrackById(track.id))
}

exportsObj.deleteTrack = (trackId) => {
	const options = {
		where: { id: trackId }
	}
	return Track.destroy(options)
	  .then(() => ({ id: songId }))
}

module.exports = exportsObj