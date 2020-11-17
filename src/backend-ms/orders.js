const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment')
const multer  = require('multer')
const upload = multer()

//GET
async function getListData(req) {

  //定義前端searchType
  const searchTypeMap = {
    0:'A.order_number',
    1:'G.phone_number',
    2:'G.name'
  }

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
    
    //判斷前端搜尋欄位是否為空白，如果是空白進入搜尋全部條件
    if (!req.query.searchInp) {

    //filter: all unpaid backorder returning
      switch (req.query.filter) {

        //unpaid
        case 'unpaid':
          let sqlUnpaidMerchantId =
            `SELECT COUNT(1) from order_products D 
            LEFT JOIN orders A ON D.order_id = A.id
            LEFT JOIN product_skus E ON D.product_sku_id = E.id
            LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ? AND A.status = 0
            GROUP BY D.order_id`
          const [unpaidResult] = await db.query(sqlUnpaidMerchantId, [req.query.id])
          const unpaidTotalRows = unpaidResult.length

          if (unpaidTotalRows > 0) {
            let page = parseInt(req.query.page) || 1
            output.totalRows = unpaidTotalRows
            output.totalPages = Math.ceil(unpaidTotalRows / output.perPage)
    
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
    
            //撈出所有相符合的訂單產品明細
            let sqlGetUnpaidOrderProdData = `SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
                                    D.unit_price, D.quantity, E.id AS skud_id, E.specification  
                                    FROM order_products D 
                                    LEFT JOIN orders A ON D.order_id = A.id
                                    LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                    LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ? AND A.status = 0
                                    ORDER BY A.id DESC`
  
            //撈出所有訂單資料
            let sqlGetUnpaidOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                          A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                          B.full_name AS reciever, B.address, B.phone_number
                                          FROM orders A 
                                          LEFT JOIN customers G ON A.customer_id = G.id
                                          LEFT JOIN order_payments C ON A.payment_id = C.id
                                          LEFT JOIN payment_types H ON C.type = H.id
                                          LEFT JOIN order_deliveries B ON A.delivery_id = B.id
                                          ORDER BY A.id DESC`
  
            const [unpaidProductRows] = await db.query(sqlGetUnpaidOrderProdData, [req.query.id])
            const [unpaidOrderRows] = await db.query(sqlGetUnpaidOrderData)
  
            unpaidOrderRows.forEach((el) => {
              el.created_at = moment(el.start_date).format('YYYY-MM-DD')
            })
  
            //先過濾orders清單中屬於廠商ID12的訂單編號
            const targetOrder = unpaidOrderRows.filter(order => unpaidProductRows.some(prod => prod.order_id === order.id))
            //把產品明細塞入對應的訂單編號中
            const arr = targetOrder.map(order => {
              const prod_list = unpaidProductRows.filter(prod => prod.order_id === order.id)
              order.prod_list = prod_list
              order.sum = order.delivery_fee + prod_list.reduce((a, b) => a + b.unit_price * b.quantity, 0)
              return order
            })
            output.filter = 'all'
            //取出對應頁數的5筆資料
            output.rows = arr.slice( (output.page - 1) * output.perPage, (output.page - 1) * output.perPage + 5)
          }
    
          return output

          //backorder
          case 'backorder':
            let sqlBackorderMerchantId =
            `SELECT COUNT(1) from order_products D 
            LEFT JOIN orders A ON D.order_id = A.id
            LEFT JOIN product_skus E ON D.product_sku_id = E.id
            LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ? AND A.status = 1
            GROUP BY D.order_id`
          const [backorderResult] = await db.query(sqlBackorderMerchantId, [req.query.id])
          const backorderTotalRows = backorderResult.length

          if (backorderTotalRows > 0) {
            let page = parseInt(req.query.page) || 1
            output.totalRows = backorderTotalRows
            output.totalPages = Math.ceil(backorderTotalRows / output.perPage)
    
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
    
            //撈出所有相符合的訂單產品明細
            let sqlGetBackorderOrderProdData = `SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
                                    D.unit_price, D.quantity, E.id AS skud_id, E.specification  
                                    FROM order_products D 
                                    LEFT JOIN orders A ON D.order_id = A.id
                                    LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                    LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ? AND A.status = 1
                                    ORDER BY A.id DESC`
  
            //撈出所有訂單資料
            let sqlGetBackorderOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                          A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                          B.full_name AS reciever, B.address, B.phone_number
                                          FROM orders A 
                                          LEFT JOIN customers G ON A.customer_id = G.id
                                          LEFT JOIN order_payments C ON A.payment_id = C.id
                                          LEFT JOIN payment_types H ON C.type = H.id
                                          LEFT JOIN order_deliveries B ON A.delivery_id = B.id
                                          ORDER BY A.id DESC`
  
            const [backorderProductRows] = await db.query(sqlGetBackorderOrderProdData, [req.query.id])
            const [backorderOrderRows] = await db.query(sqlGetBackorderOrderData)
  
            backorderOrderRows.forEach((el) => {
              el.created_at = moment(el.start_date).format('YYYY-MM-DD')
            })
  
            //先過濾orders清單中屬於廠商ID12的訂單編號
            const targetOrder = backorderOrderRows.filter(order => backorderProductRows.some(prod => prod.order_id === order.id))
            //把產品明細塞入對應的訂單編號中
            const arr = targetOrder.map(order => {
              const prod_list = backorderProductRows.filter(prod => prod.order_id === order.id)
              order.prod_list = prod_list
              order.sum = order.delivery_fee + prod_list.reduce((a, b) => a + b.unit_price * b.quantity, 0)
              return order
            })
            output.filter = 'all'
            //取出對應頁數的5筆資料
            output.rows = arr.slice( (output.page - 1) * output.perPage, (output.page - 1) * output.perPage + 5)
          }
    
          return output

          //returning
        case 'returning':
            let sqlReturnMerchantId =
            `SELECT COUNT(1) from order_products D 
            LEFT JOIN orders A ON D.order_id = A.id
            LEFT JOIN product_skus E ON D.product_sku_id = E.id
            LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ? AND A.status = 5
            GROUP BY D.order_id`
          const [returnResult] = await db.query(sqlReturnMerchantId, [req.query.id])
          const returnTotalRows = returnResult.length

          if (returnTotalRows > 0) {
            let page = parseInt(req.query.page) || 1
            output.totalRows = returnTotalRows
            output.totalPages = Math.ceil(returnTotalRows / output.perPage)
    
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
    
            //撈出所有相符合的訂單產品明細
            let sqlGetReturnOrderProdData = `SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
                                    D.unit_price, D.quantity, E.id AS skud_id, E.specification  
                                    FROM order_products D 
                                    LEFT JOIN orders A ON D.order_id = A.id
                                    LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                    LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ? AND A.status = 5
                                    ORDER BY A.id DESC`
  
            //撈出所有訂單資料
            let sqlGetReturnOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                          A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                          B.full_name AS reciever, B.address, B.phone_number
                                          FROM orders A 
                                          LEFT JOIN customers G ON A.customer_id = G.id
                                          LEFT JOIN order_payments C ON A.payment_id = C.id
                                          LEFT JOIN payment_types H ON C.type = H.id
                                          LEFT JOIN order_deliveries B ON A.delivery_id = B.id
                                          ORDER BY A.id DESC`
  
            const [returnProductRows] = await db.query(sqlGetReturnOrderProdData, [req.query.id])
            const [returnOrderRows] = await db.query(sqlGetReturnOrderData)
  
            returnOrderRows.forEach((el) => {
              el.created_at = moment(el.start_date).format('YYYY-MM-DD')
            })
  
            //先過濾orders清單中屬於廠商ID12的訂單編號
            const targetOrder = returnOrderRows.filter(order => returnProductRows.some(prod => prod.order_id === order.id))
            //把產品明細塞入對應的訂單編號中
            const arr = targetOrder.map(order => {
              const prod_list = returnProductRows.filter(prod => prod.order_id === order.id)
              order.prod_list = prod_list
              order.sum = order.delivery_fee + prod_list.reduce((a, b) => a + b.unit_price * b.quantity, 0)
              return order
            })
            output.filter = 'all'
            //取出對應頁數的5筆資料
            output.rows = arr.slice( (output.page - 1) * output.perPage, (output.page - 1) * output.perPage + 5)
          }
    
          return output

          //all
        default:
          let sqlMerchantId =
            `SELECT COUNT(1) from order_products D 
            LEFT JOIN orders A ON D.order_id = A.id
            LEFT JOIN product_skus E ON D.product_sku_id = E.id
            LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ?
            GROUP BY D.order_id`
          const [result] = await db.query(sqlMerchantId, [req.query.id])
          const totalRows = result.length

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
    
            //撈出所有相符合的訂單產品明細
            let sqlGetOrderProdData = `SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
                                    D.unit_price, D.quantity, E.id AS skud_id, E.specification  
                                    FROM order_products D 
                                    LEFT JOIN orders A ON D.order_id = A.id
                                    LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                    LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ?
                                    ORDER BY A.id DESC`
  
            //撈出所有訂單資料
            let sqlGetOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                          A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                          B.full_name AS reciever, B.address, B.phone_number
                                          FROM orders A 
                                          LEFT JOIN customers G ON A.customer_id = G.id
                                          LEFT JOIN order_payments C ON A.payment_id = C.id
                                          LEFT JOIN payment_types H ON C.type = H.id
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
            //取出對應頁數的5筆資料
            output.rows = arr.slice( (output.page - 1) * output.perPage, (output.page - 1) * output.perPage + 5)
          }
    
          return output

          //如前端搜尋欄位有值，進入模糊搜尋條件
      }} else {
        switch (req.query.filter) {
          default:
            let sqlMerchantId =
              `SELECT COUNT(1) totalRows from order_products D
              LEFT JOIN orders A ON D.order_id = A.id
              LEFT JOIN customers G ON A.customer_id = G.id
              LEFT JOIN product_skus E ON D.product_sku_id = E.id
              LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id  = ? AND ?? LIKE ?`
            const [[{ totalRows }]] = await db.query(sqlMerchantId, [req.query.id,`${searchTypeMap[req.query.searchType]}`,`%${req.query.searchInp}%`])
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
                                      LEFT JOIN customers G ON A.customer_id = G.id
                                      LEFT JOIN product_skus E ON D.product_sku_id = E.id
                                      LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = ? AND ?? LIKE ? 
                                      ORDER BY A.id DESC`
    
              let sqlGetOrderData = `SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
                                            A.status, B.type AS delivery_type, B.price AS delivery_fee, 
                                            B.full_name AS reciever, B.address, B.phone_number
                                            FROM orders A 
                                            LEFT JOIN customers G ON A.customer_id = G.id
                                            LEFT JOIN order_payments C ON A.payment_id = C.id
                                            LEFT JOIN payment_types H ON C.type = H.id
                                            LEFT JOIN order_deliveries B ON A.delivery_id = B.id
                                            ORDER BY A.id DESC`
    
              const [productRows] = await db.query(sqlGetOrderProdData, [req.query.id, `${searchTypeMap[req.query.searchType]}`,`%${req.query.searchInp}%`])
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
            output.rows = arr.slice( (output.page - 1) * output.perPage, (output.page - 1) * output.perPage + 5)

            }
      
            return output
        }
      }

    }


router.get('/list', async (req, res) => {
    const output = await getListData(req)
    res.json(output)
  })

module.exports = router

//PUT

router.put('/list', async (req, res) => {
  const data = { ...req.body }
   const sqlUpdateOrder = `UPDATE orders A 
                            INNER JOIN order_deliveries B 
                            ON A.delivery_id = B.id
                            SET A.status = ?, B.full_name=?, B.phone_number =?, B.address =?
                            WHERE A.id = ?`

   const [{affectedRows, changedRows }] = await db.query(sqlUpdateOrder, [data.status, data.reciever, data.phone_number, data.address , data.id])

   if (affectedRows === 0 ){
     return res.json({
       error: 'Update data failed',
       success: false
     })
   }
   res.json({
     affectedRows: affectedRows,
     changedRows: changedRows,
     success: !!changedRows,
   })
})