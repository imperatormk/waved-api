const exportsObj = {}

const Config = require('../models').config

exportsObj.getConfig = () => {
  return Config.findAll()
}

exportsObj.getConfigByKey = (cnfKey) => {
  const options = {
		where: { key: cnfKey }
	}
	return Config.findOne(options)
}

exportsObj.upsertConfig = (config) => {
	return Config
		.upsert(config, { returning: true })
		.then((result) => {
			return result.length ? result[0] : result
		})
}

exportsObj.deleteConfig = (cnfKey) => {
	const options = {
		where: { key: cnfKey }
	}
	return Config.destroy(options)
	  .then(() => ({ key: cnfKey }))
}

module.exports = exportsObj