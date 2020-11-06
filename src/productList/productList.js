const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

async function getProducts(products) {
  // 傳入 products example
  // const [products] = await db.query("SELECT products.*, product_categories.name FROM products JOIN product_categories ON products.categories_id = product_categories.id ORDER BY `products`.`created_at` DESC");
  const [skus] = await db.query("SELECT * FROM product_skus");

  return products.map((product) => {

    //切割照片路徑
    const img = product.image_path.trim().split(",")[0]
    product.image_path = img

    // 增加spec
    product.skus = product.skus ? product.skus : [];
    for (i in skus) {
      if (product.id === skus[i].product_id) {
        product.skus.push(skus[i]);
      }
    }
    return product;
  });
}




//get all products
router.get("/" , async(req, res) => {
  const choice = req.query.sort
  switch(choice) {
      case 'lastest':
        // sort by lastest
        const [products] = await db.query("SELECT products.*, product_categories.name FROM products JOIN product_categories ON products.categories_id = product_categories.id ORDER BY `products`.`created_at` DESC");

        // const filters = products.filter(product => product.name === '鋼筆/沾水筆/墨水')
        // console.log(filters)
        res.json(await getProducts(products));
      break

      case '-price':
        // sort by -price
      db.query('SELECT * FROM `products` ORDER BY `products`.`price` ASC').then(([results])=>{
        res.json(results)
      })

      
      break

      case 'price':
        // sort by price
      db.query('SELECT * FROM `products` ORDER BY `products`.`price` DESC').then(([results])=>{
        res.json(results)
      })
      break

      default:
         // sort by id
        const [ById] = await db.query("SELECT products.*, product_categories.name FROM products JOIN product_categories ON products.categories_id = product_categories.id ORDER BY `products`.`id` ASC");
        res.json(await getProducts(ById));
}
})

router.get('/categories' , async (req,res) =>{
    const [categories] = await db.query("SELECT * FROM `product_categories`")
    res.json(categories)
})

module.exports = router;