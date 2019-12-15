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

exportsObj.updateTrack = (track) => {
	const options = {
		where: { id: track.id }
	}
	return Track.update(track, options)
}

exportsObj.deleteTrack = (track) => {
	if (!track || !track.id) return Promise.reject({ msg: 'invalidQuery' })
	const options = {
		where: track
	}
	return Track.destroy(options)
	  .then(() => (track))
}

module.exports = exportsObj