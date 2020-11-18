const express = require("express");
const moment = require('moment-timezone');
const db = require(__dirname + "/../db_connect");

const router = express.Router();
//得到order_number
// router.get("/",async(req,res)=>{
//   const sqlOrdernumber ="SELECT orders.order_number FROM orders WHERE customer_id = 1";
  
//得到清單資料
router.get("/", async (req, res) => {
  // console.log(1)

  const sqlOrdernumber =`SELECT DISTINCT orders.order_number,merchants.id AS merchants_id,merchants.brand_name FROM orders LEFT JOIN order_products ON orders.id = order_products.order_id LEFT JOIN product_skus ON order_products.product_sku_id = product_skus.id LEFT JOIN products ON product_skus.product_id = products.id LEFT JOIN merchants ON products.merchant_id = merchants.id WHERE customer_id = 1 ORDER BY order_number DESC`;



  // console.log('req',req)
  //query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
  const[results1]= await db.query(sqlOrdernumber,[req.query.customer_id]);
   console.log('results1',results1)

   const orderNumList = results1.map((item)=>{
     return item.order_number
   })
   console.log('orderNumList',orderNumList)

   const str = orderNumList.join(',')
  //  const str = orderNumList.toString()
   console.log('str',str)
   console.log(typeof(str))
   const sqlStr = "(" + str + ")"

   const merchants_id = results1.map((skus)=>{
    return skus.merchants_id
  })
  console.log('merchants_id',merchants_id)
  console.log('ccccc')

  const strmerchant  = merchants_id.join(',')
 //  const str = orderNumList.toString()
  console.log('strmerchant',strmerchant)
  console.log('bbbbb')
  console.log(typeof(strmerchant))
  const sqlStrmerchant = "(" + strmerchant + ")"

   const sqlProductdetails =
   `SELECT orders.order_number, product_skus.id AS sku_id ,orders.created_at,order_products.unit_price,order_products.quantity,products.title,products.image_path,product_skus.specification,merchants.brand_name,merchants.id AS merchants_id FROM orders LEFT JOIN order_products ON orders.id = order_products.order_id 
   LEFT JOIN product_skus ON order_products.product_sku_id = product_skus.id 
   LEFT JOIN products ON product_skus.product_id = products.id 
   LEFT JOIN merchants ON products.merchant_id = merchants.id WHERE order_number IN ${sqlStr} AND merchants.id IN ${sqlStrmerchant}`;



  //  `SELECT orders.order_number, product_skus.id AS sku_id ,orders.created_at,order_products.unit_price,order_products.quantity,products.title,products.image_path,product_skus.specification,merchants.brand_name,merchants.id AS merchants_id
  //  FROM orders
  //  FULL JOIN order_products
  //  ON rders.id = order_products.order_id
  //  FULL JOIN product_skus ON order_products.product_sku_id = product_skus.id 
  //  FULL JOIN products ON product_skus.product_id = products.id 
  //  FULL JOIN merchants ON products.merchant_id = merchants.id`



   const[results2]= await db.query(sqlProductdetails)
   console.log('results2',results2)
   
  results2.map((product) => {
    // console.log(product.image_path)
    const img = product.image_path.trim().split(",")[0];
    product.image_path = img;
    // console.log('product.image_path-->',product.image_path)
   });
    results2.forEach((el) => {
      el.created_at = moment(el.created_at).format("YYYY-MM-DD");
    });
//過濾是否同一張訂單
   const finalList = results1.map((skus)=>{ 
     const arr = results2.filter((merchants)=> merchants.merchants_id === skus.merchants_id&merchants.order_number === skus.order_number&merchants.brand_name===skus.brand_name)
     console.log('arr',arr)
     skus.merchants = arr
     return skus
   })

   console.log('finalList', finalList)
  
   


// const sameOrdernumber = results2.filter(order=>results1.some(prod=>prod.order_number===orders.order_number))
 

  // console.log(3)
  //將資料庫圖片路徑切割
  // if (!results1.length) return res.send("NO fund data");

  res.json(results1);
});

module.exports = router;
