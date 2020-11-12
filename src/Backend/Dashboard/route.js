const express = require("express");

const db = require(__dirname + "/../../db_connect");
const router = express.Router();

router.get("/", (req, res) => {
  res.send('hi')
});

router.get("/star", (req, res) => {
  db.query(
    `SELECT star FROM orders JOIN order_evaluations 
    ON orders.order_number = order_evaluations.order_id 
    WHERE orders.merchant_id = 3`
  ).then(([result]) => {
    res.json(result);
  });
});

router.get("/5star", (req, res) => {
  db.query("SELECT * FROM orders JOIN order_evaluations ON orders.order_number = order_evaluations.order_id WHERE orders.merchant_id = 3 AND order_evaluations.star = 5").then(([result]) => {
    res.json(result);
  });
});

router.get("/4star", (req, res) => {
  db.query("SELECT * FROM orders JOIN order_evaluations ON orders.order_number = order_evaluations.order_id WHERE orders.merchant_id = 3 AND order_evaluations.star = 4").then(([result]) => {
    res.json(result);
  });
});

router.get("/3star", (req, res) => {
  db.query("SELECT * FROM orders JOIN order_evaluations ON orders.order_number = order_evaluations.order_id WHERE orders.merchant_id = 3 AND order_evaluations.star = 3").then(([result]) => {
    res.json(result);
  });
});

router.get("/2star", (req, res) => {
  db.query("SELECT * FROM orders JOIN order_evaluations ON orders.order_number = order_evaluations.order_id WHERE orders.merchant_id = 3 AND order_evaluations.star = 2").then(([result]) => {
    res.json(result);
  });
});

router.get("/1star", (req, res) => {
  db.query("SELECT * FROM orders JOIN order_evaluations ON orders.order_number = order_evaluations.order_id WHERE orders.merchant_id = 3 AND order_evaluations.star = 1").then(([result]) => {
    res.json(result);
  });
});

router.get("/data", (req, res) => {
  db.query("SELECT * FROM `merchant_data`").then(([result]) => {
    res.json(result);
  });
});

router.get("/incomethisweek", (req, res) => {
  db.query("SELECT * FROM `merchant_income_week` LIMIT 7, 14" ).then(([result]) => {
    res.json(result);
  });
});

router.get("/incomelastweek", (req, res) => {
  db.query("SELECT * FROM `merchant_income_week` LIMIT 0, 7" ).then(([result]) => {
    res.json(result);
  });
});

router.get("/deliverytablefordashboard", (req, res) => {
  db.query("SELECT *, order_deliveries.status AS delivery_status, orders.status AS status FROM orders JOIN order_deliveries ON orders.delivery_id = order_deliveries.id WHERE merchant_id = 3 ORDER BY orders.created_at DESC LIMIT 7").then(([result]) => {
    res.json(result);
  });
});

router.get("/deliverystatusamount", (req, res) => {
  db.query("SELECT order_deliveries.status AS delivery_status FROM orders JOIN order_deliveries ON orders.delivery_id = order_deliveries.id WHERE merchant_id = 3 ORDER BY orders.created_at DESC").then(([result]) => {
    res.json(result);
  });
});

router.get("/amountoforders", (req, res) => {
  db.query("SELECT * FROM orders WHERE merchant_id = 3 ORDER BY orders.created_at DESC").then(([result]) => {
    res.json(result);
  });
});

router.get("/merchantsellrank", (req, res) => {
  db.query("SELECT *, count(1) total_order_amount, SUM(quantity) total_quantity FROM `products` INNER JOIN product_skus ON products.id = product_skus.product_id INNER JOIN order_products ON product_skus.id = order_products.product_sku_id INNER JOIN product_categories ON product_categories.id = products.categories_id WHERE merchant_id = 3 GROUP BY product_id ORDER BY total_quantity DESC").then(([result]) => {
    res.json(result);
  });
});

router.get("/merchantsellrankgroupbyname", (req, res) => {
  db.query("SELECT *, count(1) total_order_amount, SUM(quantity) total_quantity FROM `products` INNER JOIN product_skus ON products.id = product_skus.product_id INNER JOIN order_products ON product_skus.id = order_products.product_sku_id INNER JOIN product_categories ON product_categories.id = products.categories_id WHERE merchant_id = 3 GROUP BY name ORDER BY total_quantity DESC").then(([result]) => {
    res.json(result);
  });
});

router.get("/adsinprogress", (req, res) => {
  db.query("SELECT * FROM `ads_in_progress` ORDER BY start_date DESC").then(([result]) => {
    res.json(result);
  });
});


router.get("/adsinprogressforctr", (req, res) => {
  db.query("SELECT ads_data.ads_id, clicks_day, impressions_day, days_date  FROM `ads_in_progress` INNER JOIN ads_data ON ads_in_progress.sid = ads_data.ads_id  ORDER BY days_date DESC").then(([result]) => {
    res.json(result); 
  });
});

router.post("/addnewads", (req, res) => {
  const title = req.body.title
  const budget = req.body.budget
  const bid = req.body.bid
  const start_date = req.body.start_date
  const end_date = req.body.end_date

  db.query("INSERT INTO `ads_new_ads`(`title`, `budget`, `bid`, `start_date`, `end_date`) VALUES (?, ? ,?, ? ,? )", [title, budget, bid, start_date, end_date]).then(([result]) => {
    console.log(result); 
  });
});




module.exports = router;