const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//get all products
router.get("/" , async(req, res) => {
  const choice = req.query.sort
  switch(choice) {
      case 'lastest':
        // sort by lastest
      db.query('SELECT * FROM `products` ORDER BY `products`.`created_at` DESC').then(([results])=>{
        res.json(results)
      })
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
        db.query('SELECT * FROM `products` ORDER BY `products`.`id` ASC').then(([results])=>{
          res.json(results)
        })
}
})


module.exports = router;
