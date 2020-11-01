const express = require("express");

const db = require(__dirname + "/../../db_connect");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "dashboard" }).status(200);
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
  db.query("SELECT * FROM `products` INNER JOIN product_skus ON products.id = product_skus.product_id INNER JOIN order_products ON product_skus.id = order_products.product_sku_id WHERE merchant_id = 3 ORDER BY product_sku_id DESC").then(([result]) => {
    res.json(result);
  });
});





module.exports = router;
