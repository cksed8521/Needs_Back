const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
  const sql = "SELECT `id`, `customer_id`, `question`, `answer` FROM `member question` WHERE `customer_id`=1";
  
  // console.log('req',req)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
 
    const [results] = await db.query(sql, [req.query.customer_id]);


  if (!results.length) return res.send("NO fund data");
  res.json(results);
})

module.exports = router;