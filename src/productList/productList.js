const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//get all products
router.get("/" , async(req, res) => {
  const choice = req.query.sort
  switch(choice) {
      case 'lastest':
        // sort by lastest
          const [productList] = await db.query("SELECT A.id, A.merchant_id, D.brand_name, D.brand_en_name, A.title, A.categories_id, C.name as categories_name, A.outline, A.image_path ,A.e_points_usable, A.created_at, TEMPTBL.product_id, TEMPTBL.price, TEMPTBL.sale_price FROM products A                                                                                  LEFT JOIN (SELECT B.product_id, B.price, B.sale_price FROM product_skus B GROUP BY B.product_id) TEMPTBL ON TEMPTBL.product_id = A.id                                                                                               LEFT JOIN product_categories AS C on A.categories_id = C.id                                                      LEFT JOIN merchants AS D on A.merchant_id = D.id ORDER BY `A`.`created_at` DESC")
          
          productList.map((product)=>{

            const img = product.image_path.trim().split(",")[0]
            product.image_path = img
          })
          res.json(productList)
      break

      case '-price':
        // sort by -price
        const [lowPrice] = await db.query("SELECT A.id, A.merchant_id, D.brand_name, D.brand_en_name, A.title, A.categories_id, C.name as categories_name, A.outline, A.image_path ,A.e_points_usable, A.created_at, TEMPTBL.product_id, TEMPTBL.price, TEMPTBL.sale_price FROM products A                                                                                  LEFT JOIN (SELECT B.product_id, B.price, B.sale_price FROM product_skus B GROUP BY B.product_id) TEMPTBL ON TEMPTBL.product_id = A.id                                                                                               LEFT JOIN product_categories AS C on A.categories_id = C.id                                                      LEFT JOIN merchants AS D on A.merchant_id = D.id ORDER BY `TEMPTBL`.`price` ASC")
          
        lowPrice.map((product)=>{

          const img = product.image_path.trim().split(",")[0]
          product.image_path = img
        })
        res.json(lowPrice)
      break

      case 'price':
        // sort by price
        const [hightPrice] = await db.query("SELECT A.id, A.merchant_id, D.brand_name, D.brand_en_name, A.title, A.categories_id, C.name as categories_name, A.outline, A.image_path ,A.e_points_usable, A.created_at, TEMPTBL.product_id, TEMPTBL.price, TEMPTBL.sale_price FROM products A                                                                                  LEFT JOIN (SELECT B.product_id, B.price, B.sale_price FROM product_skus B GROUP BY B.product_id) TEMPTBL ON TEMPTBL.product_id = A.id                                                                                               LEFT JOIN product_categories AS C on A.categories_id = C.id                                                      LEFT JOIN merchants AS D on A.merchant_id = D.id ORDER BY `TEMPTBL`.`price` DESC")
          
        hightPrice.map((product)=>{

          const img = product.image_path.trim().split(",")[0]
          product.image_path = img
        })
        res.json(hightPrice)
      break

      default:
         // sort by id
         const [ById] = await db.query("SELECT A.id, A.merchant_id, D.brand_name, D.brand_en_name, A.title, A.categories_id, C.name as categories_name, A.outline, A.image_path ,A.e_points_usable, A.created_at, TEMPTBL.product_id, TEMPTBL.price, TEMPTBL.sale_price FROM products A LEFT JOIN (SELECT B.product_id, B.price, B.sale_price FROM product_skus B GROUP BY B.product_id) TEMPTBL ON TEMPTBL.product_id = A.id LEFT JOIN product_categories AS C on A.categories_id = C.id LEFT JOIN merchants AS D on A.merchant_id = D.id ORDER BY `A`.`id` ASC")
          
         ById.map((product)=>{
 
           const img = product.image_path.trim().split(",")[0]
           product.image_path = img
         })
         res.json(ById)
}
})

router.get('/categories' , async (req,res) =>{
    const [categories] = await db.query("SELECT * FROM `product_categories`")
    res.json(categories)
})


router.post('wishlist' , async(req, res) => {
  console.log(req.body)
  customer_id = req.body[0]
  product_id = req.body[0]
  const sql = 'INSERT'

  const [{ affectedRows, insertId }] = await db.query(sql, [customer_id,product_id]);

  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  });
})

module.exports = router;