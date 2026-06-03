require("dotenv").config();

const {
  Product,
  ProductDetail,
  productSvcConn,
} = require("../services/product/product.db");

const imageMap = {
  "DEMO-SUA-001": "demo-products/sua_th.jpg",
  "DEMO-BANH-001": "demo-products/banh_banh_nhan.jpg",
  "DEMO-MI-001": "demo-products/mi_hao_hao.jpg",
  "DEMO-RAU-001": "demo-products/rau_cai.jpg",
  "DEMO-TAO-001": "demo-products/tao_my.jpg",
};

async function main() {
  for (const [code, imagePath] of Object.entries(imageMap)) {
    const product = await Product.findOneAndUpdate(
      { code },
      { avt: imagePath },
      { new: true }
    );

    if (product) {
      await ProductDetail.updateMany(
        { productId: product._id },
        { photos: [imagePath] }
      );

      console.log(`Updated ${code} -> ${imagePath}`);
    } else {
      console.log(`Product not found: ${code}`);
    }
  }

  await productSvcConn.close();
  console.log("Done!");
}

main().catch(async (err) => {
  console.error(err);
  try { await productSvcConn.close(); } catch (_) {}
  process.exit(1);
});
