const express = require("express");

const db = require(__dirname + "/../db_connect");
const fs = require("fs");
const multer = require('multer');
const { type } = require("os");
const upload = multer({dest:__dirname+'/image'})
// const moment = require('moment-timezone');
const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());


//get picture
// router.post("/upload", upload.array("imgage",12), (req, res) => {
//   const TempFile = req.files.upload
//   const TempPathFile = TempFile.path

//   const targetPathUrl = path.join(__dirname + "/image/" + TempFile.name)
  
//   if(path.extname(TempFile.originalFilename).toLowerCase() === ".png" || ".jpg"){
//     fs.rename(TempPathFile,targetPathUrl ,err => {
//       if(err) return console.log(err)
//     }) 
//   }

//   console.log(req.file);
// });


// get all template
// router.get("/", (req, res) => {
//   db.query("SELECT * FROM template").then(([results])=>{
//     res.json(results)
//   })
// });

//get sepcific template
// router.get("/:id", async(req, res) => {
//   const sql = "SELECT * FROM template WHERE id=?";

//     const [results] = await db.query(sql, [req.params.id]);
//     if(! results.length){
//         return res.json('error');
//     }
//     res.json(results[0]);
// });

//get free template
router.get("/", async(req, res) => {
    // const sql = `SELECT template.*, plan_type.name AS plan_name FROM template 
    // LEFT JOIN plan_type
    // ON template.plan_id = plan_type.id
    // WHERE plan_type.id = ?`  
    let sql=``
    {[req.query.type] == 3 ? 
       sql= `SELECT template.*, plan_type.name AS plan_name FROM template 
       LEFT JOIN plan_type
       ON template.plan_id = plan_type.id`
    :
     sql=`
    SELECT template.*, plan_type.name AS plan_name FROM template 
        LEFT JOIN plan_type
        ON template.plan_id = plan_type.id
        WHERE plan_type.id = ?`;
    }
  console.log('req',req.query.type)
        // req.query.type !== 3 ? 
        //  sql = `SELECT template.*, plan_type.name AS plan_name FROM template 
        // LEFT JOIN plan_type
        // ON template.plan_id = plan_type.id
        // WHERE plan_type.id = ?`;
        // :
        // const sql = `SELECT template.*, plan_type.name AS plan_name FROM template 
        // LEFT JOIN plan_type
        // ON template.plan_id = plan_type.id`;
        // }
        

    const [results] = await db.query(sql, [req.query.type]);

    console.log('results',results)
    if(!results.length){
        return res.json('error');
    }
    res.json(results);
});


// router.post('/',upload.none(),async(req, res) => {
//   console.log(req.body);
//   if ( !req.body[0]) return
//     const data = {
//       title: req.body[0],
//       image: req.body[1],
//       outline: req.body[2],
//       detial: JSON.stringify(req.body[3]),
//     };
//   const sql =
//     "INSERT INTO `template` set ?";
//    console.log("3");
//   const [{ affectedRows, insertId }] = await db.query(sql, [data]);
//     console.log("4");
//   res.json({
//     success: !!affectedRows,
//     affectedRows,
//     insertId,
//   });
// });


// router.get("/articles/:id", (req, res) => {
//   const article = article.find((c) => c.id === parseInt(req.params.id));
//   if (!article) res.status(404).send("The article is not found");
// });

module.exports = router;