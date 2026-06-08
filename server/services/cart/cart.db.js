const mongoose = require('mongoose');
const CartSchema = require('../../schema/mongoose/cart.schema');
const { DB_CONFIG, MONGOOSE_MODEL_NAME } = require('../../utils/constants');

const cartSvcConn = mongoose.createConnection(DB_CONFIG.CART_SERVICE.URL);

const Cart = cartSvcConn.model(
	MONGOOSE_MODEL_NAME.CART,
	CartSchema,
	'carts',
);

module.exports = {
	Cart,
	cartSvcConn,
};
