const express = require("express");

const db = require(__dirname + "/../db_connect");
const moment = require('moment')
const router = express.Router();

router.get("/" , async(req, res) => {
    const url = "SELECT * FROM `channel_message`"
    const [results] =await db.query(url)
        results.forEach(el =>{
            el.time = moment(el.timestamp ).format('h:mm a')
        })
        res.json(results)
    })
  


module.exports = router;
