const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();


router.get('/', (req, res)=>{
    res.send('address-book');
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

router.get('/api', async (req, res)=>{
    const output = {
        page: 1,
        perPage: 5,
        totalRows: 0,
        totalPage: 0,
        rows: []
    };

    const [ [ { totalRows } ] ] = await db.query("SELECT COUNT(1) totalRows FROM address_book");

    res.json(totalRows);

});




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
