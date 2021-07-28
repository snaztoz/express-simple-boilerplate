const express = require('express');
const router = express.Router();

const orm = require('../services/orm');


router.get('/', async (req, res, next) => {
  const models = await orm();
  const users = await models.User.findAll();

  res.send(JSON.stringify(users, null, 4));
});


module.exports = router;
