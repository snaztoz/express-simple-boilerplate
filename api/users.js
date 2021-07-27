const express = require('express');
const router = express.Router();

const database = require('../services/database');


router.get('/', async (req, res, next) => {
  const conn = await database();
  const [rows] = await conn.query('SELECT 1 + 1 AS result');

  res.send({result: rows[0].result});
});


module.exports = router;
