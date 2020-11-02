const express = require("express");
const { exists } = require("fs");
const db = require(__dirname + "/../db_connect");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "products" }).status(200);
});

async function getProductData(id) {
  const product_sql =
    "SELECT products.*, product_categories.name FROM products JOIN product_categories ON products.categories_id = product_categories.id WHERE products.id = ?";
  const [[product]] = await db.query(product_sql, [id]);

  const skus_sql = "SELECT * FROM product_skus WHERE product_id = ?";
  const [skus] = await db.query(skus_sql, [id]);
  product.skus = skus;

  const images = product.image_path.trim().split(",");
  product.image_path = images;

  return product;
}

async function getMerchantData(id, exclude) {
  const merchant_sql =
    "SELECT * FROM merchants LEFT JOIN brand_info ON merchants.id = brand_info.merchant_id WHERE merchants.id=?";
  const [[merchant]] = await db.query(merchant_sql, [id]);

  const products_sql =
    "SELECT id,title,image_path FROM products WHERE merchant_id=? and id!=? LIMIT 6";
  const [products] = await db.query(products_sql, [id, exclude]);

  merchant.products = products.map((product) => {
    product.image_path = product.image_path.trim().split(",")[0];
    return product;
  });

  const reformattedArray = products.map((item) => Object.values(item)[0]);
  const placeholder = Array(reformattedArray.length).fill("?").join();

  const skus_sql =
    "SELECT * FROM product_skus WHERE product_id IN (" + placeholder + ")";
  const [skus] = await db.query(skus_sql, reformattedArray);

  products.map(function (product) {
    sku = skus.find((s) => s.product_id == product.id);
    return (product.price = sku.price), (product.sale_price = sku.sale_price);
  });

  let since = new Date(merchant.created_at);
  let now = new Date();
  let months = (since.getFullYear() - now.getFullYear()) * 12;
  months -= since.getMonth();
  months += now.getMonth();
  merchant.created_months = months;

  const product_count_sql = "SELECT COUNT(1) as count FROM products WHERE merchant_id = ?";
  const [[row]] = await db.query(product_count_sql, [id]);
  merchant.product_amount = row.count;

  merchant.review = 4.8;
  merchant.review_amount = 3600;
  merchant.fans = 21;

  return merchant;
}

router.get("/:id", async (req, res) => {
  res.json(await getProductData(req.params.id));
});

router.get("/merchant/:id", async (req, res) => {
  res.json(await getMerchantData(req.params.id, req.query.exclude));
});

module.exports = router;
