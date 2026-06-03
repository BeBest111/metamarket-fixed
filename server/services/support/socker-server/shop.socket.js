const { Shop } = require('../../user/user.db');
const { ShopChat } = require('../support.db');
const { shopIO } = require('./socket-config');

let onlineShops = [];

const DEMO_AUTO_REPLY = true;
const DEMO_REPLY_DELAY_MS = 600;

function buildAutoReply(message = '') {
	const normalized = message.toLowerCase();
	if (normalized.includes('gia') || normalized.includes('bao nhieu')) {
		return 'Gia san pham dang hien tren trang. Ban vui long cho minh ma san pham nhe.';
	}
	if (normalized.includes('ship') || normalized.includes('giao')) {
		return 'Phi giao hang duoc tinh o buoc thanh toan. Ban can ho tro them gi khong a?';
	}
	return 'Shop da nhan tin. Nhan vien se phan hoi som nhat a.';
}

function findOnlineShopByShopId(shopId) {
	return onlineShops.find((shop) => shop.shopId === shopId);
}

async function updateShopChatHistory(userId, shopId, newMessage) {
	const shopDocs = await ShopChat.findOne({ userId, shopId });
	if (shopDocs) {
		await ShopChat.updateOne(
			{ _id: shopDocs._id },
			{ $push: { history: newMessage } },
		);
	} else {
		await ShopChat.create({
			userId,
			shopId,
			createdAt: newMessage.time,
			history: [newMessage],
		});
	}
}

shopIO.on('connection', function (socket) {
	socket.on('fc shop online', async (shopId) => {
		onlineShops.push({ socketId: socket.id, shopId });
		socket.join(`shop-${shopId}`);
		shopIO.to(`shop-${shopId}`).emit('fs shop online');
		Shop.update({ isOnline: true }, { where: { shopId } });
	});

	socket.on('fc user connect', (data) => {
		const { userId, shopId } = data;
		socket.join([`shop-${shopId}`, `user-${userId}`]);
	});

	socket.on('fc user chat', async (data) => {
		const { userId, shopId, message, time } = data;

		const newMessage = { isUser: true, content: message, time };
		const onlineShop = findOnlineShopByShopId(shopId);

		if (onlineShop) {
			shopIO
				.to(onlineShop.socketId)
				.emit('fs user chat', { userId, ...newMessage });
		}

		await updateShopChatHistory(userId, shopId, newMessage);

		if (DEMO_AUTO_REPLY) {
			const reply = buildAutoReply(message);
			const replyMessage = {
				isUser: false,
				content: reply,
				time: new Date(),
			};
			setTimeout(() => {
				shopIO.to(`user-${userId}`).emit('fs shop chat', replyMessage);
			}, DEMO_REPLY_DELAY_MS);
			await updateShopChatHistory(userId, shopId, replyMessage);
		}
	});

	socket.on('fc shop chat', async (data) => {
		const { userId, shopId, message, time } = data;
		const newMessage = { isUser: false, content: message, time };
		shopIO.to(`user-${userId}`).emit('fs shop chat', newMessage);
		await updateShopChatHistory(userId, shopId, newMessage);
	});

	socket.on('disconnect', () => {
		const index = onlineShops.findIndex((item) => item.socketId === socket.id);

		if (index !== -1) {
			const { shopId } = onlineShops[index];
			onlineShops.splice(index, 1);
			shopIO.to(`shop-${shopId}`).emit('fs shop offline');
			Shop.update({ isOnline: false }, { where: { shopId } });
		}
	});
});
