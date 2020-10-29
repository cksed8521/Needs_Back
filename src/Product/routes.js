const express = require("express");
const { exists } = require("fs");
const db = require(__dirname + "/../db_connect");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "products" }).status(200);
});

async function getProductData(id) {
  const detail_sql =
    "SELECT products.*, product_categories.name FROM products JOIN product_categories ON products.categories_id = product_categories.id WHERE products.id = ?";
  const [[detail]] = await db.query(detail_sql, [id]);

  const skus_sql = "SELECT * FROM product_skus WHERE product_id = ?";
  const [skus] = await db.query(skus_sql, [id]);
  detail.skus = skus;

  const images_sql = "SELECT image FROM product_images WHERE product_id = ?";
  const [images] = await db.query(images_sql, [id]);
  const reformattedArray = images.map((item) => Object.values(item)[0]);

  detail.images = reformattedArray;
  return detail;
}

async function getMerchantData(id, exclude) {
  const merchant_sql =
    "SELECT * FROM merchants LEFT JOIN brand_info ON merchants.id = brand_info.merchant_id WHERE merchants.id=?";
  const [[detail]] = await db.query(merchant_sql, [id]);

  const products_sql =
    "SELECT id,title,image_300 FROM products WHERE merchant_id=? and id!=? LIMIT 6";
  const [products] = await db.query(products_sql, [id, exclude]);
  detail.products = products;

  const reformattedArray = products.map((item) => Object.values(item)[0]);
  const placeholder = Array(reformattedArray.length).fill("?").join();

  const skus_sql =
    "SELECT * FROM product_skus WHERE product_id IN (" + placeholder + ")";
  const [skus] = await db.query(skus_sql, reformattedArray);

  products.map(function (product) {
    sku = skus.find((s) => s.product_id == product.id);
    return (product.price = sku.price), (product.sale_price = sku.sale_price);
  });
  return detail;
}

router.get("/:id", async (req, res) => {
  res.json(await getProductData(req.params.id));
});

router.get("/merchant/:id", async (req, res) => {
  res.json(await getMerchantData(req.params.id, req.query.exclude));
});

module.exports = router;
