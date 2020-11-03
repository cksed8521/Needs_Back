const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `order_evaluations` WHERE `customer_id`=1"
    const [results] = await db.query(sql, [req.query.customer_id])
//query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });
  router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `merchants` WHERE `customer_id`=1"
    const [results] = await db.query(sql, [req.query.customer_id])
//query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });

module.exports = router;
