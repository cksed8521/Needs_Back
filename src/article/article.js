const express = require('express')

const db = require(__dirname + '/../db_connect')
const router = express.Router()
const upload = require(__dirname + '/articleUploadModule')

//email
const sendMail = require(__dirname + '/mail')

//success to upload into EditorJS
router.post('/fetchUrl', upload.single('image'), (req, res) => {

  // url
  const imgPath = 'http://ipconfig/articleImg/' + req.file.filename
  res.json({
    success: 1,
    file: {
      url: imgPath,
      // ... and any additional fields you want to store, such as width, height, color, extension, etc
    },
  })
})


// get all article
router.get('/', (req, res) => {
  db.query('SELECT * FROM `article` ORDER BY `article`.`id` DESC').then(
    ([results]) => {
      res.json(results)
    }
  )
})

router.post('/', upload.single('image'), async (req, res) => {
  console.log(req.body)
  const setTitle = req.body[0]
  const imgPath = req.body[1]
  const setOutline = req.body[2]
  const setDetial = req.body[3]

  const sql =
    'INSERT INTO `article`(`title`, `image`, `outline`, `detial`,create_at) VALUES (?,?,?,?,now())'
  const [{ affectedRows, insertId }] = await db.query(sql, [
    setTitle,
    imgPath,
    setOutline,
    setDetial,
  ])

  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  })
})

async function getArticle(id) {
  const article_sql = 'SELECT * FROM `article` WHERE article.id=?'
  const [[product]] = await db.query(article_sql, [id])

  return product
}

router.get('/:id', async (req, res) => {
  res.json(await getArticle(req.params.id))
})

// delete article

router.delete('/:id', async (req, res) => {
  console.log(req.params.id)
  const sql = 'DELETE FROM `article` WHERE id=?'
  const [results] = await db.query(sql, [req.params.id])
  res.json(results)
})

// send email (email, title , text)
router.post('/email', (req, res) => {
  const subject = req.body[0]
  const image = req.body[1]
  const html = req.body[2].__html

  sendMail(subject, image, html, function (err, data) {
    if (err) {
      res.status(500).json({ message: 'Internal Error' })
    } else {
      res.json({ message: 'Email Send' })
    }
  })
})

module.exports = router
