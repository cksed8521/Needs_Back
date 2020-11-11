const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment-timezone')
const multer = require('multer')

const extMap = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
};

const fileFilter = function(req, file, cb){
  cb(null, !! extMap[file.mimetype])
}

const upload = multer({ dest: 'public/img/products/', fileFilter })

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
                                          TEMPTBL.sale_price, TEMPTBL.stocks
                                          FROM products A
                                          
                                          LEFT JOIN (SELECT B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
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
                                          TEMPTBL.sale_price, TEMPTBL.stocks
                                          FROM products A
                                          
                                          RIGHT JOIN (SELECT B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B WHERE B.stocks = 0
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                                    WHERE A.merchant_id = ?
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
                                          TEMPTBL.sale_price, TEMPTBL.stocks
                                          FROM products A
                                          
                                          LEFT JOIN (SELECT B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
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
                                          TEMPTBL.sale_price, TEMPTBL.stocks
                                          FROM products A
                                          
                                          LEFT JOIN (SELECT B.product_id, B.price, B.sale_price, B.stocks,
                                                GROUP_CONCAT(B.specification) AS specification
                                                FROM product_skus B 
                                                GROUP BY B.product_id) TEMPTBL 
                                                ON TEMPTBL.product_id = A.id
                                    LEFT JOIN product_categories AS C ON A.categories_id = C.id 
                                    WHERE A.merchant_id = ?
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

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



// router.post('/', upload.array("prodImg", 5), async(req,res)=>{

// })

const cpUpload = upload.fields([{ name: 'prodImg', maxCount: 5 }])

router.post('/', cpUpload, async function (req, res) {
  const submitData = { ...req.body }
  console.log('req',req.file)
  console.log('submitData',submitData)
  console.log('submitData',submitData.imgList)

  const sql = ""
  const [result] = await db.query(sql,[submitData])
  if (!result.insertId){
    return res.json({
      error: 'Insert Failed',
      success: false,
    })
  }
  res.json({
    body: submitData,
    affectedRows: result.affectedRows,
    insertId: result.insertId,
    success: true,
  })
})

//PUT

//DELETE

module.exports = router
