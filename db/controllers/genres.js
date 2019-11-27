const exportsObj = {}

const Genre = require('../models').genre

exportsObj.getGenres = () => {
	return Genre.findAll()
}

exportsObj.getGenreById = (genreId) => {
	const options = {
		where: { id: genreId }
	}
	return Genre.findOne(options)
}

exportsObj.insertGenre = (genre) => {
	return Genre.create(genre)
		.then(genre => exportsObj.getGenreById(genre.id))
}

exportsObj.updateGenre = (genre) => {
	const options = {
		where: { id: genre.id }
	}
	return Genre.update(genre, options)
		.then(() => exportsObj.getGenreById(genre.id))
}

exportsObj.deleteGenre = (genreId) => {
	const options = {
		where: { id: genreId }
	}
	return Genre.destroy(options)
	  .then(() => ({ id: genreId }))
}

module.exports = exportsObj