const { Cart } = require('./cart.db');
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
	getCart: {
		params: {
			userId: ['number', { type: 'string', numeric: true }],
		},
		async handler(ctx) {
			try {
				const userId = Number(ctx.params.userId);
				let cart = await Cart.findOne({ userId }).lean();
				if (!cart) {
					cart = await Cart.create({ userId, items: [] });
				}
				return cart;
			} catch (error) {
				this.logger.error(error);
				throw new MoleculerError(error.toString(), 500);
			}
		},
	},

	addToCart: {
		params: {
			userId: ['number', { type: 'string', numeric: true }],
			productId: 'string',
			quantity: ['number', { type: 'string', numeric: true }],
			shopId: ['number', { type: 'string', numeric: true }],
		},
		async handler(ctx) {
			try {
				const { productId, shopId } = ctx.params;
				const userId = Number(ctx.params.userId);
				const quantity = Number(ctx.params.quantity);

				let cart = await Cart.findOne({ userId });
				if (!cart) {
					cart = new Cart({ userId, items: [] });
				}

				const existingItemIndex = cart.items.findIndex(
					(item) => item.productId === productId,
				);

				if (existingItemIndex > -1) {
					cart.items[existingItemIndex].quantity += quantity;
				} else {
					cart.items.push({ productId, quantity, shopId: Number(shopId) });
				}

				cart.updatedAt = Date.now();
				await cart.save();
				return cart.toObject();
			} catch (error) {
				this.logger.error(error);
				throw new MoleculerError(error.toString(), 500);
			}
		},
	},

	updateQuantity: {
		params: {
			userId: ['number', { type: 'string', numeric: true }],
			productId: 'string',
			quantity: ['number', { type: 'string', numeric: true }],
		},
		async handler(ctx) {
			try {
				const { productId } = ctx.params;
				const userId = Number(ctx.params.userId);
				const quantity = Number(ctx.params.quantity);

				const cart = await Cart.findOne({ userId });
				if (!cart) {
					throw new MoleculerError('Cart not found', 404);
				}

				const existingItemIndex = cart.items.findIndex(
					(item) => item.productId === productId,
				);

				if (existingItemIndex > -1) {
					if (quantity <= 0) {
						cart.items.splice(existingItemIndex, 1);
					} else {
						cart.items[existingItemIndex].quantity = quantity;
					}
					cart.updatedAt = Date.now();
					await cart.save();
				}

				return cart.toObject();
			} catch (error) {
				this.logger.error(error);
				throw new MoleculerError(error.toString(), 500);
			}
		},
	},

	removeFromCart: {
		params: {
			userId: ['number', { type: 'string', numeric: true }],
			productId: 'string',
		},
		async handler(ctx) {
			try {
				const { productId } = ctx.params;
				const userId = Number(ctx.params.userId);

				const cart = await Cart.findOne({ userId });
				if (!cart) {
					throw new MoleculerError('Cart not found', 404);
				}

				cart.items = cart.items.filter((item) => item.productId !== productId);
				cart.updatedAt = Date.now();
				await cart.save();

				return cart.toObject();
			} catch (error) {
				this.logger.error(error);
				throw new MoleculerError(error.toString(), 500);
			}
		},
	},

	clearCart: {
		params: {
			userId: ['number', { type: 'string', numeric: true }],
		},
		async handler(ctx) {
			try {
				const userId = Number(ctx.params.userId);
				await Cart.updateOne({ userId }, { items: [], updatedAt: Date.now() });
				return true;
			} catch (error) {
				this.logger.error(error);
				throw new MoleculerError(error.toString(), 500);
			}
		},
	},
};
