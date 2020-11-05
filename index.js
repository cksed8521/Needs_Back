require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http');
const db = require(__dirname+'/src/db_connect')
const PORT = process.env.PORT || 5000

//如自己葉面需要用可以從這裡copy到自己的檔案裡
const fs = require('fs')
const {v4: uuidv4} = require('uuid')
const multer = require("multer")
const upload = multer({ dest: __dirname + "/tmp_uploadsc" })
const axios = require('axios')
const moment = require('moment')

const socketio = require('socket.io')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require(__dirname +'/src/Chat/users');
const server = http.createServer(app);
const io = socketio(server);


const cors = require('cors')
const corsOptions = {
  credentials : true,
  origin: function (origin, cb){
      console.log('origin:', origin)
      cb(null,true)
  }
}

const router = require('./router')


app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(router)
app.use(cors())


//測試資料庫連線
app.get("/try-db", (req, res) => {
  db.query("SELECT * FROM `products` WHERE 1").then(([result]) => {
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
app.use('/bk-products-api', require(__dirname + '/src/backend-ms/products'));
app.use('/bk-contracts-api', require(__dirname + '/src/backend-ms/contracts'));
app.use('/bk-orders-api', require(__dirname + '/src/backend-ms/orders'));
app.use('/products', require('./src/Product/routes'));
app.use("/productlist", require(__dirname + "/src/productList/productList"));
app.use("/article", require(__dirname + "/src/article/article"));
app.use("/member", require(__dirname + "/src/member/memberdata_api"));
app.use('/TemplateList', require( __dirname + '/src/TemplateList/TemplateList'));



//socketIo
io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left. `,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});


app.use(express.static(__dirname + "/public/"));

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

// app.listen(process.env.PORT || 5000, ()=>{
//   console.log(`Server has started on port ${PORT}`);
// })

