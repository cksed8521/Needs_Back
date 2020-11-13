const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
  const sql = "SELECT order_evaluations.*, merchants.brand_name, brand_info.index_img FROM order_evaluations LEFT JOIN merchants ON order_evaluations.merchant_id = merchants.id LEFT JOIN brand_info ON order_evaluations.merchant_id = brand_info.merchant_id WHERE `customer_id` = ? AND order_evaluations.buyer_message IS NOT null";
  // console.log('req',req)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
 
    const [results] = await db.query(sql, [req.query.customer_id]);
    console.log(2)
    results.map((product) => {
      console.log(product.image_path)
      //將資料庫圖片路徑切割
      const img = product.image_path.trim().split(",")[0]
      // console.log(img)
      product.image_path = img
    })
    console.log(3)


  if (!results.length) return res.send("NO fund data");
  res.json(results);
})

module.exports = router;