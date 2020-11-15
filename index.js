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


//引用自己的route資料夾
app.use(express.static(__dirname + "/public"));
app.use('/login-api', require( __dirname + '/src/login/login_api'));
app.use('/signup-api', require( __dirname + '/src/login/signup_api'));
app.use('/bk-products-api', require(__dirname + '/src/backend-ms/products'));
app.use('/bk-contracts-api', require(__dirname + '/src/backend-ms/contracts'));
app.use('/bk-orders-api', require(__dirname + '/src/backend-ms/orders'));
app.use('/products', require('./src/Product/routes'));
app.use('/orders', require('./src/order/routes'));
app.use("/productlist", require(__dirname + "/src/productList/productList"));
app.use("/article", require(__dirname + "/src/article/article"));
app.use("/member", require(__dirname + "/src/member/memberdata_api"));
app.use('/payments', require('./src/payment/routes.js'));
app.use("/comment", require(__dirname + "/src/member/memcomment_api"));
app.use("/shop", require(__dirname + "/src/member/memshop_api"));
app.use("/like", require(__dirname + "/src/member/memlike_api"));
app.use("/inform", require(__dirname + "/src/member/meminformation_api"));
app.use("/qa", require(__dirname + "/src/member/memqa_api"));
app.use('/Template', require( __dirname + '/src/template/Template'));
app.use("/get-categories-api", require(__dirname + "/src/backend-ms/categories"));
app.use("/chat", require(__dirname + "/src/Chat/Chat"));



//socketIo
io.on("connection", (socket) => {
  socket.on("join",async ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    // socket.emit("message", { text: `你好 ${user.name}, 請問找什麼呢 ?`, });

    //  try to set login type and passing info to MySQL
    const loginTime = moment().format('YYYY-MM-DD h:mm')
    const logintype_sql = "INSERT INTO `channel_login_type`(`id`, `name`, `last_active`, `login_type`) VALUES (?,?,?)"
    await db.query(logintype_sql , [user.name, loginTime, ])

    socket.broadcast
      .to(user.room)
      .emit("message", {text: `${user.name} 已上線` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", async( message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message, time:moment().format('h:mm a') });

    //send message info to MySQL
    const to_name = user.name
    const room = user.room
    const timeNow = moment().format('YYYY-MM-DD h:mm')

    const chanel_sql = "INSERT INTO `channel_message`(`to_name`,`room` ,`message`,`timestamp`) VALUES (?,?,?,?)"
    await db.query(chanel_sql , [to_name,room ,message, timeNow])

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        text: `${user.name} 已下線. `,
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
