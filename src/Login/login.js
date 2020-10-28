const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const multer  = require('multer')
const upload = multer()


router.post('/try-post', ((req, res) => {
    res.json(req.body)
}))

router.post('/memberlogin', upload.none(),  async (req, res) => {
    const submitData = req.body
    const output = {
        user: {submitData, username: ''},
        success: false
    }
    const sql = "SELECT id, email, name as merchant_name FROM merchant_contacts WHERE email = ? AND password = SHA1(?)"
    const [results] = await db.query(sql, [req.body.username, req.body.password])
    if (results.length){
        output.user.username = results[0].merchant_name
        output.success = true
    }
    console.log(output)
    res.json(output)
})


module.exports = router