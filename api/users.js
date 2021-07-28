const express = require('express');
const router = express.Router();

const { sequelize } = require('../models');


router.get('/', async (req, res, next) => {
  const users = await sequelize.models.User.findAll();

  res.send(JSON.stringify(users, null, 4));
});


module.exports = router;
