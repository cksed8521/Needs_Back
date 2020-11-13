const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const multer = require('multer')
const upload = multer()

//商家登入
router.post('/merchantlogin', upload.none(), async (req, res) => {
  const submitData = req.body
  const output = {
    user: { id: 0, username: '', role: 'merchant' },
    account: submitData,
    success: false,
  }
  const sql = `SELECT A.id, A.email, A.name as merchant_name, B.brand_en_name FROM merchant_contacts A
               LEFT JOIN merchants B 
               ON A.merchant_id = B.id 
               WHERE email = ? AND password = SHA1(?)`

  const [results] = await db.query(sql, [req.body.username, req.body.password])
  console.log('results', results)
  if (results.length) {
    output.user.id = results[0].id
    output.user.username = results[0].merchant_name
    output.user.brand_en_name = results[0].brand_en_name
    output.success = true
  }
  console.log(output)
  res.json(output)
})

//會員登入
router.post('/memberlogin', upload.none(), async (req, res) => {
  const submitData = req.body
  const output = {
    user: { id: 0, username: '', role: 'member' },
    account: submitData,
    success: false,
  }
  const sql =
    'SELECT id, email, name as member_name FROM customers WHERE email = ? AND password = SHA1(?)'
  const [results] = await db.query(sql, [req.body.username, req.body.password])
  if (results.length) {
    output.user.id = results[0].id
    output.user.username = results[0].member_name
    output.success = true
  }
  console.log(output)
  res.json(output)
})

//後台登入
router.post('/needslogin', upload.none(), async (req, res) => {
  const submitData = req.body
  const output = {
    user: { id: 0, username: '', role: 'needs' },
    account: submitData,
    success: false,
  }
  const sql =
    'SELECT id, account, name as needs_name FROM needs_manager WHERE account = ? AND password = SHA1(?)'
  const [results] = await db.query(sql, [req.body.username, req.body.password])
  if (results.length) {
    output.user.id = results[0].id
    output.user.username = results[0].needs_name
    output.success = true
  }
  console.log(output)
  res.json(output)
})

module.exports = router
