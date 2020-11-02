const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const multer  = require('multer')
const upload = multer()


//商家登入
router.post('/merchantlogin', upload.none(),  async (req, res) => {
    const submitData = req.body
    const output = {
        user: {submitData, id:0 ,username: ''},
        success: false
    }
    const sql = "SELECT id, email, name as merchant_name FROM merchant_contacts WHERE email = ? AND password = SHA1(?)"
    const [results] = await db.query(sql, [req.body.username, req.body.password])
    console.log('results',results)
    if (results.length){
        output.user.id = results[0].id
        output.user.username = results[0].merchant_name
        output.success = true
    }
    console.log(output)
    res.json(output)
})


//會員登入
router.post('/memberlogin', upload.none(),  async (req, res) => {
    const submitData = req.body
    const output = {
        user: {submitData, id:0 ,username: ''},
        success: false
    }
    const sql = "SELECT id, email, name as member_name FROM customers WHERE email = ? AND password = SHA1(?)"
    const [results] = await db.query(sql, [req.body.username, req.body.password])
    if (results.length){
        output.user.id = results[0].id
        output.user.username = results[0].member_name
        output.success = true
    }
    console.log(output)
    res.json(output)
})

//後台登入


module.exports = router