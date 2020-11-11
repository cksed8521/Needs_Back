const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const moment = require('moment')
const multer = require('multer')
const upload = multer()

async function getCategoryData() {
    const sql =
      "SELECT A.id, A.name AS parentCategory, COALESCE(GROUP_CONCAT(B.id,':',B.name), '') AS category FROM product_categories A LEFT JOIN product_categories B ON B.parent_id = A.id GROUP BY A.id LIMIT 8"
    const [categories] = await db.query(sql)  
    output = categories
    return output
  }


  router.get('/', async (req, res) => {
    const output = await getCategoryData(req)
    res.json(output)
  })

  
  module.exports = router