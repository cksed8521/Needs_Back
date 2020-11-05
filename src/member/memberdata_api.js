const express = require("express");
const moment = require('moment-timezone')
const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `customers` WHERE id=?"
    const [results] = await db.query(sql, [req.query.id])
    // console.log('res',res)
    results.forEach(el=>{
        el.birthday = moment(el.birthday).format('YYYY-MM-DD');
        el.creat_date = moment(el.creat_date).format('YYYY-MM-DD');
    });
    res.json(results)

//console.log req-->(req.query.id)query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });



module.exports = router;
