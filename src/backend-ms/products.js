const e = require('express')
const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment-timezone')
const multer = require('multer')

const extMap = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../../public/img/products')
  },
  filename: function (req, file, cb) {
    const ext = extMap[file.mimetype]
    if (ext) {
      cb(null, file.originalname)
    } else {
      cb(new Error('寫入檔案名稱失敗'))
    }
  },
})

const fileFilter = function (req, file, cb) {
  cb(null, !!extMap[file.mimetype])
}

const upload = multer({ storage, fileFilter })

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
  //filter: all launched soldout unlaunched
  switch (req.query.filter) {
    //launched
    case 'launched':
      let sqlMerchantIdLaunched =
        'SELECT COUNT(1) totalLaunchedRows from products AS A WHERE A.merchant_id = ? AND A.launch_date <= NOW()'
      const [[{ totalLaunchedRows }]] = await db.query(sqlMerchantIdLaunched, [
        req.query.id,
      ])
      console.log('totalLaunchedRows', totalLaunchedRows)
      if (totalLaunchedRows > 0) {
        let page = parseInt(req.query.page) || 1
        output.totalRows = totalLaunchedRows
        output.totalPages = Math.ceil(totalLaunchedRows / output.perPage)

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

        let sqlGetMerchantData = ` SELECT A.id, A.title, C.name as categories_name, A.outline, A.description, 
                                          A.launch_date, A.image_path, TEMPTBL.specification, TEMPTBL.price, 
                                          TEMPTBL.sale_price, TEMPTBL.stocks, TEMPQUA.sold_quantity
                                          FROM products A
                                          LEFT JOIN (SELECT B.id, B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B 
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                          LEFT JOIN(SELECT A.id AS product_id, SUM(D.quantity) AS sold_quantity 
                                          FROM order_products D
                                          LEFT JOIN product_skus B ON D.product_sku_id = B.id
                                          LEFT JOIN products A ON B.product_id = A.id
                                          GROUP BY A.id) TEMPQUA
                                          ON A.id = TEMPQUA.product_id         
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                                    LEFT JOIN order_products AS D ON TEMPTBL.id = D.product_sku_id 
                                    WHERE A.merchant_id = ? AND A.launch_date < now()
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el) => {
          el.launch_date = moment(el.launch_date).format('YYYY-MM-DD')
        })
        output.filter = 'launched'
        output.rows = results
      }

      return output

    //soldout
    case 'soldout':
      let sqlMerchantIdSoldOut =
        'SELECT COUNT(1) totalSoldOutRows from products AS A  LEFT JOIN  product_skus AS B ON A.id = B.product_id WHERE A.merchant_id = ? AND B.stocks = 0'
      const [[{ totalSoldOutRows }]] = await db.query(sqlMerchantIdSoldOut, [
        req.query.id,
      ])
      console.log('totalSoldOutRows', totalSoldOutRows)
      if (totalSoldOutRows > 0) {
        let page = parseInt(req.query.page) || 1
        output.totalRows = totalSoldOutRows
        output.totalPages = Math.ceil(totalSoldOutRows / output.perPage)

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

        let sqlGetMerchantData = ` SELECT A.id, A.title, C.name as categories_name, A.outline, A.description, 
                                          A.launch_date, A.image_path, TEMPTBL.specification, TEMPTBL.price, 
                                          TEMPTBL.sale_price, TEMPTBL.stocks, TEMPQUA.sold_quantity
                                          FROM products A
                                          LEFT JOIN (SELECT B.id, B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B 
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                          LEFT JOIN(SELECT A.id AS product_id, SUM(D.quantity) AS sold_quantity 
                                          FROM order_products D
                                          LEFT JOIN product_skus B ON D.product_sku_id = B.id
                                          LEFT JOIN products A ON B.product_id = A.id
                                          GROUP BY A.id) TEMPQUA
                                          ON A.id = TEMPQUA.product_id         
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                                    LEFT JOIN order_products AS D ON TEMPTBL.id = D.product_sku_id 
                                    WHERE A.merchant_id = ? AND TEMPTBL.stocks = 0
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el) => {
          el.launch_date = moment(el.launch_date).format('YYYY-MM-DD')
        })
        output.filter = 'soldout'
        output.rows = results
      }

      return output

    //unlaunched
    case 'unlaunched':
      let sqlMerchantIdUnlaunched =
        'SELECT COUNT(1) totalUnlaunchedRows from products AS A WHERE A.merchant_id = ? AND A.launch_date > NOW()'
      const [
        [{ totalUnlaunchedRows }],
      ] = await db.query(sqlMerchantIdUnlaunched, [req.query.id])
      console.log('totalUnlaunchedRows', totalUnlaunchedRows)
      if (totalUnlaunchedRows > 0) {
        let page = parseInt(req.query.page) || 1
        output.totalRows = totalUnlaunchedRows
        output.totalPages = Math.ceil(totalUnlaunchedRows / output.perPage)

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

        let sqlGetMerchantData = ` SELECT A.id, A.title, C.name as categories_name, A.outline, A.description, 
                                          A.launch_date, A.image_path, TEMPTBL.specification, TEMPTBL.price, 
                                          TEMPTBL.sale_price, TEMPTBL.stocks, TEMPQUA.sold_quantity
                                          FROM products A
                                          LEFT JOIN (SELECT B.id, B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B 
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                          LEFT JOIN(SELECT A.id AS product_id, SUM(D.quantity) AS sold_quantity 
                                          FROM order_products D
                                          LEFT JOIN product_skus B ON D.product_sku_id = B.id
                                          LEFT JOIN products A ON B.product_id = A.id
                                          GROUP BY A.id) TEMPQUA
                                          ON A.id = TEMPQUA.product_id         
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                                    LEFT JOIN order_products AS D ON TEMPTBL.id = D.product_sku_id
                                    WHERE A.merchant_id = ? AND A.launch_date > NOW()
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el) => {
          el.launch_date = moment(el.launch_date).format('YYYY-MM-DD')
        })
        output.filter = 'unlaunched'
        output.rows = results
      }

      return output

    default:
      let sqlMerchantId =
        'SELECT COUNT(1) totalRows from products WHERE merchant_id = ?'
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

        let sqlGetMerchantData = ` SELECT A.id, A.title, C.name as categories_name, A.outline, A.description, 
                                    A.launch_date, A.image_path, TEMPTBL.specification, TEMPTBL.price, 
                                    TEMPTBL.sale_price, TEMPTBL.stocks, TEMPQUA.sold_quantity
                                    FROM products A
                                    LEFT JOIN (SELECT B.id, B.product_id, B.price, B.sale_price, B.stocks,
                                          GROUP_CONCAT(B.specification) AS specification
                                          FROM product_skus B 
                                          GROUP BY B.product_id) TEMPTBL 
                                          ON TEMPTBL.product_id = A.id
                                    LEFT JOIN(SELECT A.id AS product_id, SUM(D.quantity) AS sold_quantity 
                                    FROM order_products D
                                    LEFT JOIN product_skus B ON D.product_sku_id = B.id
                                    LEFT JOIN products A ON B.product_id = A.id
                                    GROUP BY A.id) TEMPQUA
                                    ON A.id = TEMPQUA.product_id         
                              LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                              LEFT JOIN order_products AS D ON TEMPTBL.id = D.product_sku_id
                              WHERE A.merchant_id = ?
                              ORDER BY id DESC LIMIT ${(output.page - 1) * output.perPage}, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el) => {
          el.launch_date = moment(el.launch_date).format('YYYY-MM-DD')
        })
        output.filter = 'all'
        output.rows = results
      }

      return output
  }
}

//GET
router.get('/list', async (req, res) => {
  const output = await getListData(req)
  res.json(output)
})

//POST
const cpUpload = upload.fields([{ name: 'imgList', maxCount: 5 }])

router.post('/', cpUpload, async function (req, res) {
  console.log('req', req)

  const submitData = { ...JSON.parse(req.body.formData) }
  // console.log('req',req)
  // console.log('req.files.imgList',req.files.imgList)

  //把所有圖片的filename寫入陣列再合併到submitData
  const arr = []
  req.files.imgList &&
    req.files.imgList.map((item, index) => arr.push(item.filename))
  submitData.image_path = arr.toString()
  console.log('submitData', submitData)

  //把submitData中部分值取出寫入products
  const prodData = {
    merchant_id: req.query.id,
    title: submitData.title,
    categories_id: submitData.category,
    outline: submitData.outline,
    image_path: submitData.image_path,
    type: req.query.prodType,
    launch_date: submitData.launchDate,
    created_at: new Date(),
  }
  console.log('prodData', prodData)

  const sqlInsertProd = 'INSERT INTO products SET ?'
  const [prodResult] = await db.query(sqlInsertProd, prodData)

  if (!prodResult.insertId) {
    return res.json({
      error: 'Insert product Failed',
      success: false,
    })
  }

  //把product insertId取出並寫入skus資料表
  const prodInsertId = prodResult.insertId

  //定義skusData
  const skusData = {
    product_id: prodInsertId,
    price: Number(submitData.price.replace(/[^0-9.-]+/g,"")),
    specification: '-',
    sale_price: Number(submitData.salePrice.replace(/[^0-9.-]+/g,"")) || 0,
    stocks: submitData.stock,
  }

  //判斷submitData中有多少個specification，將specification的值取出塞入一個陣列
  const specArr = []
  for (const key of Object.keys(submitData)) {
    if (key.includes('specification')) specArr.push(submitData[key])
  }

  if (specArr.length === 0) {
    console.log('skusData',skusData)
    const sqlInsertSkus = 'INSERT INTO product_skus SET ?'
    const [skusResult] = await db.query(sqlInsertSkus, skusData)

    if (!skusResult.insertId) {
      const sqlDelProd =
        'DELETE A.* B.* FROM products A LEFT JOIN product_skus B ON A.id = B.product_id where A.id = ?'
      const [result] = await db.query(sqlDelProd, prodInsertId)

      return res.json({
        error: 'Insert product skus Failed',
        success: false,
      })
    }

  } else {

    //根據規格的數量，用for迴圈執行多次skus資料表的寫入
    for (let i = 0; i < specArr.length; i++) {
      skusData.specification = specArr[i]

      const sqlInsertSkus = 'INSERT INTO product_skus SET ?'
      const [skusResult] = await db.query(sqlInsertSkus, skusData)

      if (!skusResult.insertId) {
        const sqlDelProd =
          'DELETE A.* B.* FROM products A LEFT JOIN product_skus B ON A.id = B.product_id where A.id = ?'
        const [result] = await db.query(sqlDelProd, prodInsertId)

        return res.json({
          error: 'Insert product skus Failed',
          success: false,
        })
      }
    }
  }

  res.json({
    body: submitData,
    affectedRows: prodResult.affectedRows,
    insertId: prodResult.insertId,
    success: true,
  })
})

//PUT
//DELETE

module.exports = router
