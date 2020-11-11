const express = require("express");
const moment = require('moment-timezone')
const db = require(__dirname + "/../db_connect");
const upload = require(__dirname + '/upload-avatar-module');
const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `customers` WHERE id=?"
    const [results] = await db.query(sql, [req.query.id])
// console.log('res',res)
    
    if(! results.length) return res.send('NO fund data')


    results.forEach(el=>{
        el.birthday = moment(el.birthday).format('YYYY-MM-DD');
        el.creat_date = moment(el.creat_date).format('YYYY-MM-DD');
    });
    res.json(results)

//console.log req-->(req.query.id)query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    
  });


  router.post("/", async (req, res) => {
    const data = {...req}
    // console.log('data.body',data.body)
    const sql = "UPDATE `customers` SET ? WHERE `customers`.`id` = ?;"

    const [{affectedRows, changedRows}] = await db.query(sql, [ data.body, req.query.id ]);
    // {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
    // console.log('affectedRows',affectedRows)
    // console.log('changedRows',changedRows)
    res.json({
        success: !!changedRows,
        affectedRows,
        changedRows,

    });
   
  });

router.post("/upload", upload.single("avatar") , async(req, res) =>{
  // console.log(req.params.id)
  console.log(req)
  const sql =  "UPDATE `customers` SET `avatar` = ? WHERE `id` = ?"
  console.log(2)
  const [{affectedRows , insertId}] = await db.query(sql , [req.file.filename,req.query.id])
  console.log(3)
  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  })
})



module.exports = router;
