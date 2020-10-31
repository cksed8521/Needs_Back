require('dotenv').config()

const express = require('express')
const app = express()
const db = require(__dirname+'/src/db_connect')
const http = require('http')
const PORT = process.env.PORT || 5000

//如自己葉面需要用可以從這裡copy到自己的檔案裡
const fs = require('fs')
const {v4: uuidv4} = require('uuid')
const socketio = require('socket.io')
const multer = require("multer")
const upload = multer({ dest: __dirname + "/tmp_uploads" })
const axios = require('axios')
const moment = require('moment-timezone')


const cors = require('cors')
const corsOptions = {
  credentials : true,
  origin: function (origin, cb){
      console.log('origin:', origin)
      cb(null,true)
  }
}

const server = http.createServer(app)
const io = socketio(server)
const router = require('./router')


app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(router)
app.use(cors(corsOptions))


//測試資料庫連線
app.get("/try-db", (req, res) => {
  db.query("SELECT * FROM`products` WHERE 1").then(([result]) => {
    res.json(result);
  })
})

//測試圖片上傳
app.post("/try-uploads", upload.single("img"), (req, res) => {
  console.log(1);
  console.log(req.file);
  console.log(2);
  res.json(req.file);
});


//引用自己的route資料夾
app.use(express.static(__dirname + "/public"));
app.use('/login-api', require( __dirname + '/src/login/login_api'));
app.use('/signup-api', require( __dirname + '/src/login/signup_api'));
app.use("/product", require(__dirname + "/src/productList/productList"));
app.use("/article", require(__dirname + "/src/article/article"));
app.use('/signup-api', require(__dirname + '/src/login/signup_api'));
app.use('/bk-products-api', require(__dirname + '/src/backend-ms/products'));





// server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

app.listen(process.env.PORT || 5000, ()=>{
  console.log(`Server has started on port ${PORT}`);
})