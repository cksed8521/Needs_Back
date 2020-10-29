require('dotenv').config()

const express = require('express')
const db = require(__dirname+'/src/db_connect')

const fs = require('fs')
const {v4: uuidv4} = require('uuid')

const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const multer = require("multer");
const upload = multer({ dest: __dirname + "/tmp_uploads" });

const PORT = process.env.PORT || 5000

const router = require('./router')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(router)
app.use(cors())

app.get("/try-db", (req, res) => {
  db.query("SELECT * FROM`products` WHERE 1").then(([result]) => {
    res.json(result);
  });
});



app.use("/productlist", require(__dirname + "/src/productList/productList"));
app.use("/article", require(__dirname + "/src/article/article"));


app.use(express.static(__dirname + "/public/articleImg"));

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

