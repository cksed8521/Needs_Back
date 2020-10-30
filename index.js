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
  db.query("SELECT * FROM`customers` WHERE 1").then(([result]) => {
    res.json(result);
  });
});

app.post("/try-uploads", upload.single("img"), (req, res) => {
  console.log(1);
  console.log(req.file);
  console.log(2);
  res.json(req.file);
});

app.use("/product", require(__dirname + "/src/productList/productList"));
app.use("/article", require(__dirname + "/src/article/article"));
app.get("/member", require(__dirname + "/src/member/memberdata"));
/*app.get('/',req,res)=> {
  res.send('<h2>Hollow</h2>');
}*/
//上傳大頭貼圖檔並判斷是復為圖檔
app.post('/upload-avatar', upload.single('avatar'), (req, res)=>{
  console.log(req.file);

  if(req.file && req.file.originalname){
      let ext = '';

      switch(req.file.mimetype){
          case 'image/png':
          case 'image/jpeg':
          case 'image/gif':
//確定為圖檔後搬移圖檔至路徑位置
              fs.rename(
                  req.file.path,
                  __dirname + '/src/member/img' + req.file.originalname,
                  error=>{
                      return res.json({
                          success: true,
                          path: '/img/'+ req.file.originalname
                      });
                  });

              break;
          default:
              fs.unlink(req.file.path, error=>{
                  return res.json({
                      success: false,
                      msg: '不是圖檔'
                  });
              });

      }
  } else {
      return res.json({
          success: false,
          msg: '沒有上傳檔案'
      });
  }
});

app.use(express.static(__dirname + "/public"));

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`))

