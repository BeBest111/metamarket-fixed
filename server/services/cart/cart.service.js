const { SVC_NAME } = require('../../utils/constants');
const cartActions = require('./cart.action');

module.exports = {
	name: SVC_NAME.CART,

	actions: {
		...cartActions,
	},
};
