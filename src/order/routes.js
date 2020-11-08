const express = require("express");
const { exists } = require("fs");
const util = require("util");
const db = require(__dirname + "/../db_connect");
const router = express.Router();
const moment = require("moment-timezone");

async function createOrderInTransaction(order) {
  const newOrderData = { ...order };

  // id, type, price, full_name, address, phone_number, note, status
  const deliveryData = {};
  deliveryData.type = newOrderData.orderContent.delivery;
  deliveryData.price = newOrderData.orderContent.deliveryPrice;
  deliveryData.full_name = newOrderData.userInfo.name;
  deliveryData.address = newOrderData.userInfo.address;
  deliveryData.phone_number = newOrderData.userInfo.phone_number;
  deliveryData.note = newOrderData.userInfo.note;
  deliveryData.status = 0;
  let sql = `INSERT INTO order_deliveries set ?`;
  [{ affectedRows, insertId }] = await db.query(sql, [deliveryData]);
  const delivery_insertId = insertId;
  const delivery_affectedRows = affectedRows;

  // id, type, status, paid_time, atm_virtual_account, atm_expired_at, note, created_at, updated_at
  const paymentData = {};
  paymentData.type = newOrderData.payment;
  paymentData.status = 0;
  paymentData.created_at = new Date();
  paymentData.updated_at = new Date();
  sql = `INSERT INTO order_payments set ?`;
  [{ affectedRows, insertId }] = await db.query(sql, [paymentData]);
  const payment_insertId = insertId;
  const payment_affectedRows = affectedRows;

  // id, merchant_id, customer_id, order_number, delivery_id, payment_id, e_discount_log_id, discount, amount, e_bonus_log_id, status, note, created_at, updated_at
  const orderData = {};
  orderData.merchant_id = newOrderData.orderContent.merchantId;
  orderData.customer_id = newOrderData.customer_id;
  orderData.order_number = moment().format("YYYYMMDD");
  orderData.delivery_id = delivery_insertId;
  orderData.payment_id = payment_insertId;
  orderData.amount = newOrderData.orderContent.sum;
  orderData.status = 0;
  orderData.created_at = new Date();
  orderData.updated_at = new Date();
  sql = `INSERT INTO orders set ?`;
  [{ affectedRows, insertId }] = await db.query(sql, [orderData]);
  const order_insertId = insertId;
  const order_affectedRows = affectedRows;

  orderData.order_number = orderData.order_number + order_insertId;
  sql = `UPDATE orders SET order_number = ? WHERE id = ?`;
  [{ affectedRows }] = await db.query(sql, [
    orderData.order_number,
    order_insertId,
  ]);

  // id, order_id, product_sku_id, unit_price, quantity
  sql = `INSERT INTO order_products (order_id, product_sku_id, unit_price, quantity) VALUES `;
  const insertedValues = newOrderData.orderContent.products.map((product) => {
    let columns = [];
    columns.push(
      order_insertId,
      product.skuid,
      product.sale_price ? product.sale_price : product.price,
      product.amount
    )
    return `(${columns.join(',')})`;
  }).join(',');
  console.log(sql + insertedValues);
  await db.query(sql + insertedValues);

  return {
    success:
      !!payment_affectedRows && !!delivery_affectedRows && !!order_affectedRows,
    delivery_insertId,
    payment_insertId,
    order_insertId,
  };
}

async function addOrder(order) {
  await db.query("START TRANSACTION");
  try {
    const result = await createOrderInTransaction(order);
    await db.query("ROLLBACK");
    return result;
    //   await db.query('COMMIT');
  } catch (e) {
    console.log("Got an error while createing order");
    console.log(e);
    await db.query("ROLLBACK");
  }
}

router.post("/", async (req, res) => {
  const result = await addOrder(req.body);
  console.log(result);
  res.json(result);
});

module.exports = router;
