const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `order_evaluations` WHERE `customer_id`=?"
    const [results] = await db.query(sql, [req.query.customer_id])
    
//query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });
  router.get("/", async (req, res) => {
    console.log('results',results)
    const sql = "SELECT order_evaluations.*, merchants.brand_name FROM order_evaluations LEFT JOIN merchants ON order_evaluations.merchant_id = merchants.id WHERE customer_id = ?"
    const [results] = await db.query(sql, [req.query.customer_id])
//query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });

module.exports = router;
