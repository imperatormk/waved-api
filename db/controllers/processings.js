const exportsObj = {}

const Processing = require('../models').processing
const Order = require('../models').order
const Song = require('../models').song

const getPagination = (pageData = {}) => {
  const limit = pageData.size || 100
	const page = pageData.page || 1
	
	const options = {
    limit,
    offset: limit * (page - 1)
  }
  return options
}

exportsObj.getProcessings = (pageData, userId) => {
  const options = {
		...getPagination(pageData),
		include: [{
      model: Order,
      as: 'order'
    }, {
      model: Song,
      as: 'song'
    }]
  }
  if (userId) options.where = { usrId: userId }
  
  return Processing.findAll(options)
		.then((processings) => {
			return Processing.count({
				where: options.where || {}
			})
				.then((count) => ({
					totalElements: count,
					content: processings
				}))
		})
}

exportsObj.getProcessingById = (pcsId) => {
  const options = {
		where: { id: pcsId },
    include: [{
      model: Order,
      as: 'order'
    }]
	}
	return Processing.findOne(options)
}

exportsObj.insertProcessing = (processing) => {
	return Processing
		.create(processing)
		.then(processing => exportsObj.getProcessingById(processing.id))
}

exportsObj.updateProcessing = (processing) => {
	const options = {
		where: { id: processing.id }
	}
	return Processing.update(processing, options)
}

module.exports = exportsObj