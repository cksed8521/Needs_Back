const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment')
const multer = require('multer')
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
  //filter: all ended
  switch (req.query.filter) {
    //ended
    case 'ended':
      let sqlMerchantIdEnded =
        'SELECT COUNT(1) totalEndedRows from contracts AS A WHERE A.merchant_id = ? AND A.end_date <= NOW()'
      const [[{ totalEndedRows }]] = await db.query(sqlMerchantIdEnded, [
        req.query.id,
      ])
      if (totalEndedRows > 0) {
        let page = parseInt(req.query.page) || 1
        output.totalRows = totalEndedRows
        output.totalPages = Math.ceil(totalEndedRows / output.perPage)

        if (page < 1) {
          output.page = 1
        } else if (page > output.totalPages) {
          output.page = output.totalPages
        } else {
          output.page = page
        }

        // 處理頁碼按鈕
        ;(function (page, totalPages, prevNum) {
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

        let sqlGetMerchantData = ` SELECT A.id, A.contract_id, B.name AS plan_name, 
                                          A.start_date, A.end_date, A.amount, A.paid_time
                                          FROM contracts A
                                          LEFT JOIN plan_type B
                                          ON A.plan_id = B.id
                                    WHERE A.merchant_id = ? AND A.end_date <= now()
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el, index, arr) => {
          moment(el.paid_time).isBefore(Date.now())
            ? (arr[index].payment_status = '已付款')
            : (arr[index].payment_status = '未付款')
          const diffDays =
            moment(el.end_date).diff(moment(el.start_date), 'days') + 1
          arr[index].total_days = diffDays
          el.start_date = moment(el.start_date).format('YYYY-MM-DD')
          el.end_date = moment(el.end_date).format('YYYY-MM-DD')
          el.paid_time = moment(el.paid_time).format('YYYY-MM-DD H:m:s')
        })
        output.filter = 'ended'
        output.rows = results
      }

      return output

    default:
      let sqlMerchantId =
        'SELECT COUNT(1) totalRows from contracts AS A WHERE A.merchant_id = ?'
      const [[{ totalRows }]] = await db.query(sqlMerchantId, [req.query.id])
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
        ;(function (page, totalPages, prevNum) {
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

        let sqlGetMerchantData = ` SELECT A.id, A.contract_id, B.name AS plan_name, 
                                          A.start_date, A.end_date, A.amount, A.paid_time
                                          FROM contracts A
                                          LEFT JOIN plan_type B
                                          ON A.plan_id = B.id
                                    WHERE A.merchant_id = ?
                                    ORDER BY id DESC LIMIT ${
                                      (output.page - 1) * output.perPage
                                    }, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.query.id])
        results.forEach((el, index, arr) => {
          if (el.paid_time) arr[index].payment_status = '已付款'
          if (!el.paid_time && moment(el.start_date).isAfter(Date.now())) arr[index].payment_status = '未付款'
          if ((!el.paid_time) && moment(el.start_date).isBefore(Date.now())) arr[index].payment_status = '已逾期'
          const diffDays = moment(el.end_date).diff(moment(el.start_date), 'days') + 1
          arr[index].total_days = diffDays
          el.start_date = moment(el.start_date).format('YYYY-MM-DD')
          el.end_date = moment(el.end_date).format('YYYY-MM-DD')
          el.paid_time = moment(el.paid_time).format('YYYY-MM-DD H:m:s')
        })
        output.filter = 'all'
        output.rows = results
      }

      return output
  }
}

router.get('/list', async (req, res) => {
  const output = await getListData(req)
  res.json(output)
})
//POST

//PUT

//DELETE

module.exports = router
