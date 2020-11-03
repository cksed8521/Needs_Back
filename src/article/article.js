const express = require("express");

const db = require(__dirname + "/../db_connect");
const moment = require('moment-timezone');
const router = express.Router();
const upload = require(__dirname + '/articleUploadModule');

//email
const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport');
const sendMail = require("./mail");
const sendmail = require(__dirname+"/mail")


//success to upload into EditorJS
router.post('/fetchUrl', upload.single("image") ,(req,res) => {
  const imgPath = "http://localhost:5000/articleImg/" + req.file.filename
    res.json({
      "success" : 1,
      "file": {
          "url" : imgPath,
          // ... and any additional fields you want to store, such as width, height, color, extension, etc
      }
  })
})

  //可以成功上傳的內容
// router.post("/upload", upload.single("image") , async(req, res) =>{
// res.json(req.file)
// const imgPath = "localhost:5000/" + req.file.filename
//   const sql = "INSERT INTO `testupload`(`image` , `create_at`) VALUES (?,now())"
//   console.log(2)
//   const [{affectedRows , insertId}] = await db.query(sql , imgPath)
//   console.log(3)
//   res.json({
//     success: !!affectedRows,
//     affectedRows,
//     insertId,
//   })
// })

// get all article
router.get("/", (req, res) => {
  db.query("SELECT * FROM `article` ORDER BY `article`.`id` DESC").then(([results])=>{
    res.json(results)
  })
});

router.post('/',upload.single("image"),async(req, res) => {
  if(!req.body[0] || !req.body[1] || !req.body[2] || !req.body[3]) return
    console.log(req.body[0])
    console.log(req.body[1])
    console.log(req.body[2])
    console.log(req.body[3])
  const setTitle = req.body[0]
  const imgPath = req.body[1]
  const setOutline = req.body[2]
  const setDetial = req.body[3]

  const sql =
    "INSERT INTO `article`(`title`, `image`, `outline`, `detial`,create_at) VALUES (?,?,?,?,now())";
   console.log("3");
  const [{ affectedRows, insertId }] = await db.query(sql, [setTitle,imgPath,setOutline,setDetial]);
    console.log("4");
  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  });
});

// send email
// router.post('/email', (req, res) =>{
//   // const [sql] = "SELECT `name`, `email` FROM `customers`"
//   const { title, email,text} = req.body
//   email = ''
//   sendMail(email, title, text , function(err,data){
//     if(err){
//       res.status(500).json({message:'Internal Error'})
//     } else {
//       res.json({message:'Email Send'})
//     }
//   })
//   res.json({message:'Message received!'})
// })




module.exports = router;
