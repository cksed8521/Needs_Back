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
app.use(cors(corsOptions))


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
app.post("/member", require(__dirname + "/src/member/memberdata_api"));
app.use("/comment", require(__dirname + "/src/member/memcomment_api"));
app.use("/shop", require(__dirname + "/src/member/memshop_api"));
app.use("/like", require(__dirname + "/src/member/memlike_api"));
app.use("/inform", require(__dirname + "/src/member/meminformation_api"));
app.use('/Template', require( __dirname + '/src/template/Template'));
app.use("/get-categories-api", require(__dirname + "/src/backend-ms/categories"));




//socketIo
io.on("connection", (socket) => {
  socket.on("join",  ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log(name)
    console.log(room)
    if (error) return callback(error);

    // Recording user and merchant channelroom  

    // const chanel_sql = "INSERT INTO `channel_Room`(`customer_name`, `channelRoom`) VALUES (?,?)"
    // const [channelroom] = await db.query(chanel_sql , [name, room])
    // res.json(channelroom)
    socket.join(user.room);

    socket.emit("message", {
      text: `你好 ${user.name}, 請問找什麼呢 ?`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", {text: `${user.name} 已上線` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message, time:moment().format('h:mm a') });

    // const chanel_sql = "INSERT INTO `channel_message`(`customer_name`, `message`,`timestamp`) VALUES (?,?)"
    // const [channelroom] = await db.query(chanel_sql , [name, room])
    // res.json(channelroom)

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

app.use('/dashboard', require(__dirname + '/src/Backend/Dashboard/route'));
app.use(express.static(__dirname + "/public/"));

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

// app.listen(process.env.PORT || 5000, ()=>{
//   console.log(`Server has started on port ${PORT}`);
// })

