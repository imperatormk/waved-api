const exportsObj = {}

const Order = require('../models').order

const getPagination = (pageData = {}) => {
  const limit = pageData.size || 100
	const page = pageData.page || 1
	
	const options = {
    limit,
    offset: limit * (page - 1)
  }
  return options
}

exportsObj.getOrders = (pageData, criteria = {}) => {
  const options = {
		...getPagination(pageData),
		where: criteria
  }
  
  return Order.findAll(options)
		.then((orders) => {
			return Order.count({
				where: options.where || {}
			})
				.then((count) => ({
					totalElements: count,
					content: orders
				}))
		})
}

exportsObj.getOrderById = (ordId) => {
  const options = {
		where: { id: ordId }
	}
	return Order.findOne(options)
}

exportsObj.insertOrder = (order) => {
	return Order
		.create(order)
		.then(order => exportsObj.getOrderById(order.id))
}

exportsObj.updateOrder = (order) => {
	const options = {
		where: { id: order.id }
	}
	return Order.update(order, options)
}

module.exports = exportsObj