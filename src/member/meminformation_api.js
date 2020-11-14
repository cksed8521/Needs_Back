const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/one", async (req, res) => {
  const sql = "SELECT customer_subscribes.*, merchants.brand_name,information.* , brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN information ON customer_subscribes.merchant_id = information.merchant_id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE customer_id = 1";
  const [results] = await db.query(sql, [req.query.customer_id]);
  // console.log('results',results)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
  if (!results.length) return res.send("NO fund data");
  res.json(results);
});
router.get("/two", async (req, res) => {
  const sql = "SELECT customer_subscribes.*, merchants.brand_name,information.* , brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN information ON customer_subscribes.merchant_id = information.merchant_id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE customer_id = 1 AND customer_subscribes.merchant_id NOT IN(100)";
  const [results] = await db.query(sql, [req.query.customer_id]);
  // console.log('results',results)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
  if (!results.length) return res.send("NO fund data");
  res.json(results);
});
router.get("/three", async (req, res) => {
  const sql = "SELECT customer_subscribes.*, merchants.brand_name,information.* , brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN information ON customer_subscribes.merchant_id = information.merchant_id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE customer_id = 1 AND customer_subscribes.merchant_id IN(100)";
  const [results] = await db.query(sql, [req.query.customer_id]);
  // console.log('results',results)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
  if (!results.length) return res.send("NO fund data");
  res.json(results);
});

module.exports = router;
