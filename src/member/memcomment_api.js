const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
  // console.log(1)
  const sql = "SELECT order_evaluations.*, products.title,products.image_path,merchants.brand_name FROM order_evaluations LEFT JOIN products ON order_evaluations.product_id = products.id LEFT JOIN merchants ON order_evaluations.merchant_id = merchants.id WHERE customer_id = ? AND order_evaluations.buyer_message IS NOT null";
  
  // console.log('req',req)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
 
    const [results] = await db.query(sql, [req.query.customer_id]);
    // console.log(2)
    results.map((product) => {
      // console.log(product.image_path)
      //將資料庫圖片路徑切割
      const img = product.image_path.trim().split(",")[0]
      // console.log(img)
      product.image_path = img
    })
    // console.log(3)


  if (!results.length) return res.send("NO fund data");
  res.json(results);
})

module.exports = router;