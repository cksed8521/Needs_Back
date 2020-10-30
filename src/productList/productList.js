const express = require("express");

const db = require(__dirname + "/../db_connect");

const router = express.Router();

//get products
router.get("/", async (req, res) => {
  db.query("SELECT * FROM products").then(([results]) => {
    res.json(result);
  });
});

//處理page
async function getListData(req) {
  const output = {
    page: 0,
    perPage: 5,
    totalRows: 0,
    totalPages: 0,
    rows: [],
    pages: [],
  };

  const [[{ totalRows }]] = await db.query(
    "SELECT COUNT(1) totalRows FROM products"
  );
  if (totalRows > 0) {
    let page = parseInt(req.query.page) || 1;
    output.totalRows = totalRows;
    output.totalPages = Math.ceil(totalRows / output.perPage);
    if (page < 1) {
      output.page - 1;
    } else if (page > output.totalPages) {
      output.page = output.totalPages;
    } else {
      output.page = page;
    }

    if (output.totalPages < 7) {
      for (let i = 1; i < output.totalPages; i++) {
        output.pages.push(i);
      }
    } else {
      const fAr = [],
        bAr = [];
      //從前面數
      for (let i = output.page - 3; i <= output.totalPages; i++) {
        if (i >= 1) {
          fAr.push(i);
        }
        if (fAr.length >= 7) break;
      }
      //從後面數
      for (let i = output.page + 3; i >= 1; i--) {
        if (i <= output.totalPages) {
          bAr.unshift(i);
        }
        if (bAr.length >= 7) break;
      }
      output.pages = fAr.length > bAr.length ? fAr : bAr;
    }

    let sql = `SELECT * FROM products ORDER BY id DESC LIMIT ${
      (output.page - 1) * output.perPage
    }, ${output.perPage}`;

    const [r2] = await db.query(sql);
    output.rows = r2;
  }
  return output;
}

router.get("/list", async (req, res) => {
  res.json(await getListData(req));
});

router.get("/api", async (req, res) => {
  const output = {
    page: 0,
    perPage: 5,
    totalRows: 0,
    totalPages: 0,
    rows: [],
    pages: [],
  };

  const [r1] = await db.query("SELECT COUNT(1) num FROM products");

  res.json(r1);
});

module.exports = router;
