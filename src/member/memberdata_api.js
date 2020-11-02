const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `customers` WHERE id=?"
    const [results] = await db.query(sql, [req.query.id])
//console.log req-->(req.query.id)query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    if(! results.length) return res.send('NO fund data')
    res.json(results)
  });

/* RESTful API
    列表
    /api/ GET

    新增
    /api/ POST

    呈現單筆
    /api/:sid GET

    修改單筆
    /api/:sid PUT

    刪除單筆
    /api/:sid DELETE
*/



/*
    列表  /list
        列表呈現 GET

    新增  /add
        表單呈現 GET, 接收資料 POST

    修改  /edit/:sid
        修改的表單呈現 GET, 接收資料 POST

    修改  /del/:sid
        POST
*/


module.exports = router;
