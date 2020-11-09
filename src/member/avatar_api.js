const express = require("express");
const moment = require('moment-timezone')
const db = require(__dirname + "/../db_connect");
const upload = require(__dirname + '/upload-avatar-module');
const router = express.Router();

//
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM `customers` WHERE id=?"
    const [results] = await db.query(sql, [req.query.id])
console.log('res',res)
    
    if(! results.length) return res.send('NO fund data')


    results.forEach(el=>{
        el.birthday = moment(el.birthday).format('YYYY-MM-DD');
        el.creat_date = moment(el.creat_date).format('YYYY-MM-DD');
    });
    res.json(results)

//console.log req-->(req.query.id)query為後端api給資料/params為前端網址列提供id訊息/   為form表單提供資料
    
  });


router.post("/", upload.single("avatar") , async(req, res) =>{

const imgPath = "http://localhost:5000/public/img/avatar" + req.file.filename
  const sql =  "UPDATE `customers` SET `avatar` = ? WHERE `id` = ?"
  console.log(2)
  const [{affectedRows , insertId}] = await db.query(sql , [imgPath,req.query.id])
  console.log(3)
  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  })
})



module.exports = router;
