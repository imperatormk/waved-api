const exportsObj = {}

const Processing = require('../models').processing
const Order = require('../models').order
const Song = require('../models').song
const User = require('../models').user

const models = {
	'order': Order,
	'song': Song,
	'buyer': User
}

const getPagination = (pageData = {}) => {
  const limit = pageData.size || 100
	const page = pageData.page || 1
	const by = pageData.by || 'id'
	const order = pageData.order || 'ASC'
	
	const options = {
    limit,
		offset: limit * (page - 1),
		order: [[by, order]]
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
			return Processing.findAll({
				where: options.where || {},
				include: options.include || [],
				attributes: ['id']
			})
				.then((countArr) => ({
					totalElements: countArr.length,
					content: processings
				}))
		})
}

exportsObj.getProcessingById = (pcsId, config = { include: [] }) => {
	const includeArr = config.include
		.map((model) => ({
			model: models[model],
			as: model
		}))

  const options = {
		where: { id: pcsId },
    include: includeArr
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