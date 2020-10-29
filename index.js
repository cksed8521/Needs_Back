require('dotenv').config()

const express = require('express')
const db = require(__dirname+'/src/db_connect')

const fs = require('fs')
const {v4: uuidv4} = require('uuid')

const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const axios = require('axios');

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const corsOptions = {
  credentials : true,
  origin: function (origin, cb){
      console.log('origin:', origin)
      cb(null,true)
  }
}

app.use(router)
app.use(cors(corsOptions))

app.get("/try-db", (req, res) => {
  db.query("SELECT * FROM`products` WHERE 1").then(([result]) => {
    res.json(result);
  });
});

app.use('/products', require('./src/Product/routes'));

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

