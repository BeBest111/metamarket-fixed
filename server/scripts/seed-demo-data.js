require("dotenv").config();

const {
  Catalog,
  Product,
  ProductDetail,
  productSvcConn,
} = require("../services/product/product.db");

const { normalizeText } = require("../utils/text");

const {
  Account,
  Contract,
  District,
  Province,
  Shop,
  Ward,
  userDb,
} = require("../services/user/user.db");

const DEMO_SHOP_ID = 1;
const DEMO_SHOP_ACCOUNT_ID = 100;

const localImages = {
  sua: "demo-products/sua_th.jpg",
  banh: "demo-products/banh_banh_nhan.jpg",
  mi: "demo-products/mi_hao_hao.jpg",
  rau: "demo-products/rau_cai.jpg",
  tao: "demo-products/tao_my.jpg",
  shop: "demo-products/shop_demo.jpg",
};

async function seedMongo() {
  console.log("[1/3] Seeding MongoDB product_service...");

  const oldDemoProducts = await Product.find({ code: /^DEMO-/ }).select("_id");
  const oldDemoProductIds = oldDemoProducts.map((p) => p._id);

  if (oldDemoProductIds.length > 0) {
    await ProductDetail.deleteMany({ productId: { $in: oldDemoProductIds } });
  }

  await Product.deleteMany({ code: /^DEMO-/ });
  await Catalog.deleteMany({ link: { $in: ["bach-hoa-demo", "thuc-pham-tuoi-demo"] } });

  const groceryCatalog = await Catalog.create({
    name: "Bach hoa demo",
    link: "bach-hoa-demo",
    categories: [
      { id: 1, name: "Sua va do uong", link: "sua-va-do-uong" },
      { id: 2, name: "Banh keo", link: "banh-keo" },
      { id: 3, name: "Mi chao pho", link: "mi-chao-pho" },
      { id: 4, name: "Gia vi", link: "gia-vi" },
    ],
  });

  const freshCatalog = await Catalog.create({
    name: "Thuc pham tuoi demo",
    link: "thuc-pham-tuoi-demo",
    categories: [
      { id: 1, name: "Rau cu", link: "rau-cu" },
      { id: 2, name: "Trai cay", link: "trai-cay" },
      { id: 3, name: "Thit ca", link: "thit-ca" },
    ],
  });

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const products = await Product.insertMany([
    {
      catalogId: groceryCatalog._id,
      categoryId: 1,
      shopId: DEMO_SHOP_ID,
      code: "DEMO-SUA-001",
      name: "Sua tuoi Vinamilk 1L",
      nameNormalized: normalizeText("Sua tuoi Vinamilk 1L"),
      price: 32000,
      stock: 100,
      discount: 5,
      purchaseTotal: 0,
      reviewTotal: 0,
      rateAvg: 0,
      avt: localImages.sua,
      unit: "hop",
      mfg: now,
      exp: nextYear,
    },
    {
      catalogId: groceryCatalog._id,
      categoryId: 2,
      shopId: DEMO_SHOP_ID,
      code: "DEMO-BANH-001",
      name: "Banh Choco Pie hop 12 cai",
      nameNormalized: normalizeText("Banh Choco Pie hop 12 cai"),
      price: 48000,
      stock: 80,
      discount: 10,
      purchaseTotal: 0,
      reviewTotal: 0,
      rateAvg: 0,
      avt: localImages.banh,
      unit: "hop",
      mfg: now,
      exp: nextYear,
    },
    {
      catalogId: groceryCatalog._id,
      categoryId: 3,
      shopId: DEMO_SHOP_ID,
      code: "DEMO-MI-001",
      name: "Mi Hao Hao tom chua cay",
      nameNormalized: normalizeText("Mi Hao Hao tom chua cay"),
      price: 4500,
      stock: 300,
      discount: 0,
      purchaseTotal: 0,
      reviewTotal: 0,
      rateAvg: 0,
      avt: localImages.mi,
      unit: "goi",
      mfg: now,
      exp: nextYear,
    },
    {
      catalogId: freshCatalog._id,
      categoryId: 1,
      shopId: DEMO_SHOP_ID,
      code: "DEMO-RAU-001",
      name: "Rau cai ngot Da Lat",
      nameNormalized: normalizeText("Rau cai ngot Da Lat"),
      price: 18000,
      stock: 50,
      discount: 0,
      purchaseTotal: 0,
      reviewTotal: 0,
      rateAvg: 0,
      avt: localImages.rau,
      unit: "kg",
      mfg: now,
      exp: nextYear,
    },
    {
      catalogId: freshCatalog._id,
      categoryId: 2,
      shopId: DEMO_SHOP_ID,
      code: "DEMO-TAO-001",
      name: "Tao Fuji nhap khau",
      nameNormalized: normalizeText("Tao Fuji nhap khau"),
      price: 69000,
      stock: 60,
      discount: 8,
      purchaseTotal: 0,
      reviewTotal: 0,
      rateAvg: 0,
      avt: localImages.tao,
      unit: "kg",
      mfg: now,
      exp: nextYear,
    },
  ]);

  await ProductDetail.insertMany(
    products.map((p) => ({
      productId: p._id,
      photos: [p.avt],
      origin: "Viet Nam",
      brand: "MetaMarket Demo",
      desc: `${p.name} la san pham demo de test tim kiem, gio hang va thanh toan.`,
      infos: [
        { label: "Ma san pham", detail: p.code },
        { label: "Don vi", detail: p.unit },
        { label: "Ton kho", detail: String(p.stock) },
      ],
    }))
  );

  return {
    catalogId: groceryCatalog._id.toString(),
    productCount: products.length,
  };
}

async function seedMySQL(catalogId) {
  console.log("[2/3] Seeding MySQL user_service...");

  await userDb.sync();

  await Province.upsert({ provinceId: 1, name: "Ha Noi", code: "HN" });
  await District.upsert({ districtId: 1, name: "Cau Giay", prefix: "Quan", provinceId: 1 });
  await Ward.upsert({ wardId: 1, name: "Dich Vong Hau", prefix: "Phuong", districtId: 1 });

  await Account.upsert({
    accountId: DEMO_SHOP_ACCOUNT_ID,
    email: "shop.demo@metamarket.test",
    type: 2,
    password: null,
    googleId: null,
    status: 1,
  });

  await Shop.upsert({
    shopId: DEMO_SHOP_ID,
    phone: "0900000001",
    foundingDate: new Date("2024-01-01"),
    name: "MetaMarket Demo Shop",
    supporterName: "Nhan vien ho tro",
    openHours: "07:00 - 21:00",
    logoUrl: localImages.shop,
    catalogId,
    isOnline: true,
    accountId: DEMO_SHOP_ACCOUNT_ID,
  });

  await Contract.upsert({
    contractId: 1,
    businessLicense: "demo-business-license.jpg",
    foodSafetyCertificate: "demo-food-safety-certificate.jpg",
    isOriginCommitment: true,
    isCustomerCareCommitment: true,
    isPolicyCommitment: true,
    shopId: DEMO_SHOP_ID,
  });
}

async function printSummary() {
  console.log("[3/3] Checking inserted demo data...");

  const catalogs = await Catalog.find({ link: /demo$/ }).select("name link categories").lean();
  const products = await Product.find({ code: /^DEMO-/ }).select("code name avt price stock unit").lean();

  console.log(`Catalogs: ${catalogs.length}`);
  console.log(`Products: ${products.length}`);
  products.forEach((p) => console.log(`- ${p.code}: ${p.name} | ${p.avt}`));
}

async function main() {
  const mongoResult = await seedMongo();
  await seedMySQL(mongoResult.catalogId);
  await printSummary();

  await productSvcConn.close();
  await userDb.close();

  console.log("Done!");
  console.log(`Inserted ${mongoResult.productCount} demo products.`);
  console.log("Try searching: sua, banh, mi, rau, tao");
}

main().catch(async (err) => {
  console.error("Seed failed:");
  console.error(err);
  try { await productSvcConn.close(); } catch (_) {}
  try { await userDb.close(); } catch (_) {}
  process.exit(1);
});
