const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const multer  = require('multer')
const upload = multer()

//商家註冊
router.post('/merchantsignup', upload.none(),  async (req, res) => {
    const submitData = {...req.body}
    let sqlGetEmail = "SELECT * FROM merchant_contacts WHERE email = ?"
    const [results] = await db.query(sqlGetEmail, req.body.email)
    console.log('results', results)
    if (results.length){
        res.json({
            body : req.body,
            error : 'email已註冊',
            success: false
        })
    }
    else{
        let sqlGetId = "SELECT FROM last_merchant"
        const [merchant_id] = await db.query(sqlGetId)
        console.log('merchant_id', merchant_id)

        res.send(merchant_id)
        // let sqlInsert = "INSERT INTO merchant_contacts SET ?"
        // submitData.merchant_id = merchant_id + 1
        // submitData.created_at = new Data()
        // const  [{affectedRows, insertId}] = await db.query(sqlInsert, submitData)
        // res.json({
        //     affectedRows,
        //     insertId,
        //     success: !!affectedRows,
        // })
     }
})


//會員註冊


module.exports = router