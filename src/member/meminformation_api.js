const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
  const sql = "SELECT customer_subscribes.*, merchants.brand_name,information.* FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN information ON customer_subscribes.merchant_id = information.merchant_id WHERE customer_id = 1";
  const [results] = await db.query(sql, [req.query.customer_id]);

  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
  if (!results.length) return res.send("NO fund data");
  res.json(results);
});

module.exports = router;
