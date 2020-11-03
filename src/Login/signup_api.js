const express = require('express')
const db = require(__dirname + '/../db_connect')
const router = express.Router()
const multer = require('multer')
const upload = multer()
const sha1 = require('sha1')

//商家註冊
router.post('/merchantsignup', upload.none(), async (req, res) => {
  const submitData = { ...req.body }
  const sqlGetEmail = 'SELECT * FROM merchant_contacts WHERE email = ?'
  const [emailDuplicated] = await db.query(sqlGetEmail, req.body.email)

  //先確認是否有重複的email
  if (emailDuplicated.length) {
    res.json({
      body: req.body,
      error: 'email已註冊',
      success: false,
    })
  } else {
    //取得商家最後一筆資料的merchant_id
    const sqlGetLastId = 'SELECT last_merchant FROM last_id'

    const [last_merchant_id] = await db.query(sqlGetLastId)
    //設新的merchant_id
    let new_merchant_id =
      parseInt(last_merchant_id[0].last_merchant.replace('M', '')) + 1
    new_merchant_id = 'M' + new_merchant_id

    //新增商家資料 只帶入merchant_id與brand_en_name 其他欄位空白
    const sqlInsertMerchant = 'INSERT INTO merchants SET ?'
    const merchantData = {
      merchant_id: new_merchant_id,
      brand_en_name: new_merchant_id,
    }
    const [insertMerchantResult] = await db.query(
      sqlInsertMerchant,
      merchantData
    )

    //如果新增失敗
    if (!insertMerchantResult.insertId) {
      return res.json({
        error: 'Insert new merchant Failed',
        success: false,
      })
    }

    //把新增商家成功的insert.id取出來
    const merchantInsertId = insertMerchantResult.insertId

    //新增商家聯絡人資料
    const sqlInsertMerchantContact = 'INSERT INTO merchant_contacts SET ?'
    let new_merchant_contact_id = new_merchant_id + '-1'

    //將使用者提交的聯絡人資料加上以下欄位寫入資料庫
    submitData.password = sha1(submitData.password)
    submitData.merchant_id = merchantInsertId
    submitData.merchant_contact_id = new_merchant_contact_id
    submitData.created_at = new Date()
    const [insertContactResult] = await db.query(
      sqlInsertMerchantContact,
      submitData
    )

    //如果新增聯絡人失敗
    if (!insertContactResult.insertId) {
      return res.json({
        error: 'Insert new merchant contact Failed',
        success: false,
      })
    }

    //新增商家成功跟聯絡人都成功 就更新last_id資料表
    let sqlUpdatedLastMerchantId =
      'UPDATE last_id SET last_merchant = ?, last_merchant_contact= ? WHERE id = 1'
    const [updateIdResult] = await db.query(sqlUpdatedLastMerchantId, [
      new_merchant_id,
      new_merchant_contact_id,
    ])

    //如果更新資料表失敗，就將剛剛寫入的資料清空
    if (!updateIdResult.affectedRows) {
      const sqlDeleteMerchatData =
        'DELETE A.*, B.* FROM merchants as A LEFT JOIN merchant_contacts as B ON B.merchant_id = A.id WHERE A.id = ?'
      const [result] = await db.query(sqlDeleteMerchatData, [
        insertMerchantResult.insertId,
      ])
      return res.json({
        error: 'Update last id Failed',
        success: false,
      })
    }
    //全部都成功回傳以下資料給前端
    res.json({
      body: submitData,
      affectedRows: insertContactResult.affectedRows,
      insertId: insertContactResult.insertId,
      success: true,
    })
  }
})

//會員註冊

module.exports = router
