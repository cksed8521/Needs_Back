const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

async function getLike(req) {
  const output = {};
  switch (req.query.filter) {
    case "brands":

      let sqlbrands =
        "SELECT customer_subscribes.*, merchants.brand_name, merchants.fans, brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE `customer_id` = ? AND customer_subscribes.merchant_id NOT IN(100)";
      const [results1] = await db.query(sqlbrands, [req.query.customer_id]);
      output.filter = "brands";
      output.rows = results1;
      // console.log("result1", results1);
      return output;

    case "product":

      let sqlproduct =
        "SELECT customer_wishlist.*, products.title, products.image_path FROM customer_wishlist LEFT JOIN products ON customer_wishlist.product_id = products.id WHERE `customer_id` = ?";
      const [results2] = await db.query(sqlproduct, [req.query.customer_id]);
      results2.map((product) => {
        const img = product.image_path.trim().split(",")[0];
        product.image_path = img;
      });
      output.filter = "product";
      output.rows = results2;
      // console.log("result2", results2);
      return output;
  }
}

router.get("/", async (req, res) => {
  const output = await getLike(req);
  console.log("output", output);
  res.json(output);
});

module.exports = router;

// router.get("/", async (req, res) => {
//   const sql = "SELECT customer_subscribes.*, merchants.brand_name, brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE `customer_id` = ? AND customer_subscribes.merchant_id NOT IN(100)";
//   const [results] = await db.query(sql, [req.query.customer_id]);

//   //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
//   if (!results.length) return res.send("NO fund data");
//   res.json(results);
// });
// router.get("/product", async (req, res) => {
//   const sql = "SELECT customer_wishlist.*, products.title, products.image_path FROM customer_wishlist LEFT JOIN products ON customer_wishlist.product_id = products.id WHERE `customer_id` = 2 ";
//   const [results] = await db.query(sql, [req.query.customer_id]);

//   //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
//   if (!results.length) return res.send("NO fund data");
//   res.json(results);
// });
