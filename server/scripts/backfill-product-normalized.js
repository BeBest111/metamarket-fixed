require('dotenv').config();

const { Product, productSvcConn } = require('../services/product/product.db');
const { normalizeText } = require('../utils/text');

async function main() {
	const products = await Product.find({}).select('_id name nameNormalized').lean();
	let updated = 0;

	for (const product of products) {
		const normalized = normalizeText(product.name);
		if (product.nameNormalized !== normalized) {
			await Product.updateOne(
				{ _id: product._id },
				{ $set: { nameNormalized: normalized } },
			);
			updated += 1;
		}
	}

	console.log(`Updated ${updated} products.`);
	await productSvcConn.close();
}

main().catch(async (err) => {
	console.error(err);
	try {
		await productSvcConn.close();
	} catch (_) {}
	process.exit(1);
});
