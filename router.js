const express = require('express')
const router = express.Router()
const multer = require("multer")
const upload = multer({ dest: __dirname + "/tmp_uploads" })

router.get('/', (req, res) => {
    res.send({ response: "Server is up and running" }).status(200)
})

router.post("/upload", upload.single("avatar"), (req, res) => {
  console.log(req.file);
})


module.exports = router