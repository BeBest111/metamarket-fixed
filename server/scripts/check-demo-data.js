require("dotenv").config();

const {
  Catalog,
  Product,
  ProductDetail,
  productSvcConn,
} = require("../services/product/product.db");

const { Shop, Province, District, Ward, userDb } = require("../services/user/user.db");

async function main() {
  const catalogs = await Catalog.find({}).select("name link categories").lean();
  const products = await Product.find({ code: /^DEMO-/ }).select("code name avt price stock unit").lean();
  const productDetails = await ProductDetail.find({}).select("productId photos brand origin").lean();
  const shops = await Shop.findAll({ raw: true });
  const provinces = await Province.findAll({ raw: true });
  const districts = await District.findAll({ raw: true });
  const wards = await Ward.findAll({ raw: true });

  console.log("MongoDB product_service:");
  console.log(`- catalogs: ${catalogs.length}`);
  console.log(`- DEMO products: ${products.length}`);
  console.log(`- productDetails: ${productDetails.length}`);
  products.forEach((p) => console.log(`  ${p.code} | ${p.name} | ${p.avt}`));

  console.log("\nMySQL user_service:");
  console.log(`- shops: ${shops.length}`);
  console.log(`- provinces: ${provinces.length}`);
  console.log(`- districts: ${districts.length}`);
  console.log(`- wards: ${wards.length}`);

  await productSvcConn.close();
  await userDb.close();
}

main().catch(async (err) => {
  console.error(err);
  try { await productSvcConn.close(); } catch (_) {}
  try { await userDb.close(); } catch (_) {}
  process.exit(1);
});
