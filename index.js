require('dotenv').config()

const express = require('express')
const app = express()
const db = require(__dirname+'/src/db_connect')
const http = require('http')
const PORT = process.env.PORT || 5000

//install自己需要的modules
const fs = require('fs')
const {v4: uuidv4} = require('uuid')
const socketio = require('socket.io')


const cors = require('cors')
const corsOptions = {
  credentials : true,
  origin: function (origin, cb){
      console.log('origin:', origin)
      cb(null,true)
  }
}
const axios = require('axios')
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

//引用自己的route資料夾
app.use('/login-api', require( __dirname + '/src/login/login_api'));
app.use('/signup-api', require( __dirname + '/src/login/signup_api'));











// server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

app.listen(process.env.PORT || 5000, ()=>{
  console.log(`Server has started on port ${PORT}`);
})