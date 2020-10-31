const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment-timezone')
const multer  = require('multer')
const upload = multer()

async function getListData (req) {
    const output = {
        page: 0,
        perPage: 5,
        totalRows: 0,
        totalPages: 0,
        rows: [],
    }

    const sqlMerchantId = "SELECT COUNT(1) totalRows from products WHERE merchant_id = ?"
    const [[{ totalRows }]] = await db.query(sqlMerchantId,[req.body.id])
    console.log('totalRows',totalRows)
    if(totalRows>0){
        let page = parseInt(req.query.page) || 1
        output.totalRows = totalRows
        output.totalPages = Math.ceil(totalRows/output.perPage)

        if(page < 1) {
            output.page = 1
        } else if(page > output.totalPages) {
            output.page = output.totalPages
        } else {
            output.page = page
        }

        // 處理頁碼按鈕
        (function(page, totalPages, prevNum){
            let beginPage, endPage
            if(totalPages <= prevNum*2+1){
                beginPage = 1
                endPage = totalPages
            } else if(page-1 < prevNum) {
                beginPage = 1
                endPage = prevNum*2+1
            } else if(totalPages-page < prevNum) {
                beginPage = totalPages-(prevNum*2+1)
                endPage = totalPages
            } else {
                beginPage = page-prevNum
                endPage = page+prevNum
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
                                    ORDER BY id DESC LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`

        const [results] = await db.query(sqlGetMerchantData, [req.body.id]);
        results.forEach(el=>{
            el.launch_date = moment(el.launch_date).format('YYYY-MM-DD')
        })
        output.rows = results
    }

   return output;
}


//GET
router.get('/list', async(req,res)=>{
    const output = await getListData(req);
    res.json(output);
})

//POST

//PUT

//DELETE

module.exports = router
