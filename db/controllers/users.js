const exportsObj = {}

const User = require('../models').user
const Admin = require('../models').admin

const addExcludes = (options = {}, excludes = ['password']) => {
	if (!options.attributes) options.attributes = {}
	const currentExcludes = options.attributes.exclude || []
	options.attributes.exclude = [...new Set([...currentExcludes, ...excludes])]

	return Promise.resolve(options)
}

exportsObj.getUsers = () => {
	return addExcludes()
		.then(options => User.findAll(options))
}

exportsObj.getUserById = (userId) => {
	const options = {
		where: { id: userId }
	}
	return addExcludes(options)
		.then(options => User.findOne(options))
}

exportsObj.getUser = (user, includePassword = false) => {
	const options = {
		where: user
	}
	const extraExcludes = includePassword ? [] : ['password']
	return addExcludes(options, extraExcludes)
		.then(options => User.findOne(options))
}

exportsObj.isAdmin = (usrId) => { // less is more
	const options = { where: { usrId } }
	return Admin.findOne(options)
		.then(admin => !!admin)
}

exportsObj.insertUser = (user) => {
	return User
		.create(user)
		.then(user => exportsObj.getUserById(user.id))
}

exportsObj.updateUser = (user) => {
	const options = {
		where: { id: user.id }
	}
	return addExcludes(options)
		.then(options => User.update(user, options))
		.then(() => exportsObj.getUserById(user.id))
}

exportsObj.deleteUser = (userId) => {
	const options = {
		where: { id: userId }
	}
	return User.destroy(options)
	  .then(() => ({ id: userId }))
}

module.exports = exportsObj