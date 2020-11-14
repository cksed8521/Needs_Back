const express = require("express");
const moment = require('moment-timezone');
const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
  // console.log(1)
  const sql =
    "SELECT orders.order_number,orders.created_at,order_products.unit_price,order_products.quantity,products.title,products.image_path,product_skus.specification,merchants.brand_name FROM orders LEFT JOIN order_products ON orders.id = order_products.order_id LEFT JOIN product_skus ON order_products.product_sku_id = product_skus.id LEFT JOIN products ON product_skus.product_id = products.id LEFT JOIN merchants ON products.merchant_id = merchants.id WHERE customer_id = 1";

  // console.log('req',req)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料

  const [results] = await db.query(sql, [req.query.customer_id]);
  // console.log(2)
  results.map((product) => {
    // console.log(product.image_path)
    const img = product.image_path.trim().split(",")[0];
    product.image_path = img;
    // console.log('product.image_path-->',product.image_path)
    console.log("222");
   });
    results.forEach((el) => {
      el.created_at = moment(el.created_at).format("YYYY-MM-DD");
    });

 

  // console.log(3)
  //將資料庫圖片路徑切割
  if (!results.length) return res.send("NO fund data");

  res.json(results);
});

module.exports = router;
