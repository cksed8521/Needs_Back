const express = require("express");
const { exists } = require("fs");
const db = require(__dirname + "/../db_connect");
const router = express.Router();

// router.get("/", (req, res) => {
//   res.send({ response: "products" }).status(200);
// });

async function getProducts() {
  const [products] = await db.query("SELECT * FROM products ");
  const [skus] = await db.query("SELECT * FROM product_skus");

  return products.map((product) => {
    product.skus = product.skus ? product.skus : [];
    for (i in skus) {
      if (product.id === skus[i].product_id) {
        product.skus.push(skus[i]);
      }
    }
    return product;
  });
}

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

  const product_count_sql =
    "SELECT COUNT(1) as count FROM products WHERE merchant_id = ?";
  const [[row]] = await db.query(product_count_sql, [id]);
  merchant.product_amount = row.count;

  merchant.review = 4.8;
  merchant.review_amount = 3600;
  merchant.fans = 21;

  return merchant;
}

async function getProductSkusGroupByMerchant(skuIds) {
  skuFilter = skuIds.join(",");
  const selectFileds =
    "products.merchant_id, brand_name, product_id, title, image_path, product_skus.id as skuid, specification, price, sale_price, stocks";

  let sql =
    `SELECT ${selectFileds} FROM products ` +
    "JOIN product_skus ON products.id = product_skus.product_id " +
    "JOIN merchants on products.merchant_id = merchants.id " +
    `WHERE product_skus.id in (${skuFilter})`;
  let [rows] = await db.query(sql);

  rows = rows.reduce((accumulator, row) => {
    if (accumulator[row.merchant_id] === undefined) {
      accumulator[row.merchant_id] = {
        merchant_id: row.merchant_id,
        brand_name: row.brand_name,
        products: [],
      };
    }
    let productSku = {...row}
    productSku.image_path = row.image_path.split(",")[0];
    delete productSku['brand_name'];
    delete productSku['merchant_id'];
    accumulator[row.merchant_id].products.push(productSku);
    return accumulator;
  }, {});

  return Object.values(rows);
}

router.post("/bulk-get-product-skus", async (req, res) => {
  res.json(await getProductSkusGroupByMerchant(req.body.skuIds));
});

router.get("/:id", async (req, res) => {
  res.json(await getProductData(req.params.id));
});

router.get("/merchant/:id", async (req, res) => {
  res.json(await getMerchantData(req.params.id, req.query.exclude));
});

router.get("/", async (req, res) => {
  res.json(await getProducts());
});

module.exports = router;
