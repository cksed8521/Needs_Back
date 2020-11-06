const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment')
const multer  = require('multer')
const upload = multer()

//GET
async function getListData(req) {
    const output = {
      page: 0,
      perPage: 5,
      filter: '',
      totalRows: 0,
      totalPages: 0,
      beginPage: 0,
      endPage: 0,
      rows: [],
    }
    //filter: all unpaid backorder returning
    switch (req.query.filter) {
      default:
        let sqlMerchantId =
          `SELECT COUNT(1) totalRows from order_products D 
          LEFT JOIN orders A ON D.order_id = A.id
          LEFT JOIN product_skus E ON D.product_sku_id = E.id
          LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ?`
        const [[{ totalRows }]] = await db.query(sqlMerchantId, [req.query.id])
        console.log('totalRows', totalRows)
        if (totalRows > 0) {
          let page = parseInt(req.query.page) || 1
          output.totalRows = totalRows
          output.totalPages = Math.ceil(totalRows / output.perPage)
  
          if (page < 1) {
            output.page = 1
          } else if (page > output.totalPages) {
            output.page = output.totalPages
          } else {
            output.page = page
          }
  
          // 處理頁碼按鈕
          (function (page, totalPages, prevNum) {
            let beginPage, endPage
            if (totalPages <= prevNum * 2 + 1) {
              beginPage = 1
              endPage = totalPages
            } else if (page - 1 < prevNum) {
              beginPage = 1
              endPage = prevNum * 2 + 1
            } else if (totalPages - page < prevNum) {
              beginPage = totalPages - (prevNum * 2 + 1)
              endPage = totalPages
            } else {
              beginPage = page - prevNum
              endPage = page + prevNum
            }
            output.beginPage = beginPage
            output.endPage = endPage
          })(page, output.totalPages, 3)
  
          let sqlGetOrderProdData = `SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
                                  D.unit_price, D.quantity, E.id AS skud_id, E.specification  
                                  FROM order_products D 
                                  LEFT JOIN orders A ON D.order_id = A.id
                                  LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                  LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ?
                                  ORDER BY A.id DESC LIMIT ${(output.page - 1) * output.perPage}, ${output.perPage}`

          let sqlGetOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                        A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                        B.full_name AS reciever, B.address, B.phone_number
                                        FROM orders A 
                                        LEFT JOIN customers G ON A.customer_id = G.id
                                        LEFT JOIN order_payments C ON A.payment_id = C.id
                                        LEFT JOIN payment_type H ON C.type = H.id
                                        LEFT JOIN order_deliveries B ON A.delivery_id = B.id
                                        ORDER BY A.id DESC`

          const [productRows] = await db.query(sqlGetOrderProdData, [req.query.id])
          const [orderRows] = await db.query(sqlGetOrderData)

          orderRows.forEach((el) => {
            el.created_at = moment(el.start_date).format('YYYY-MM-DD')
          })

          //先過濾orders清單中屬於廠商ID12的訂單編號
          const targetOrder = orderRows.filter(order => productRows.some(prod => prod.order_id === order.id))
          //把產品明細塞入對應的訂單編號中
          const arr = targetOrder.map(order => {
            const prod_list = productRows.filter(prod => prod.order_id === order.id)
            order.prod_list = prod_list
            order.sum = order.delivery_fee + prod_list.reduce((a, b) => a + b.unit_price * b.quantity, 0)
            return order
          })
          output.filter = 'all'
          output.rows = arr
        }
  
        return output
    }
  }



router.get('/list', async (req, res) => {
    const output = await getListData(req)
    console.log('output', output)
    res.json(output)
  })

module.exports = router

//PUT