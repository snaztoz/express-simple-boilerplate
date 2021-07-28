const bcrypt = require('bcrypt');

const { sequelize } = require('../models');


const SALT_ROUNDS = 10;

const createUser = async (email, username, rawPassword) => {
    const password = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    const entry = await sequelize.models.User.create({
        email,
        username,
        password
    });

    return entry;
};

const getUserByEmail = async (email) => {
    const user = await sequelize.models.User.findOne({
        where: { email }
    });

    return user;
};

const getUserByUsername = async (username) => {
    const user = await sequelize.models.User.findOne({
        where: { username }
    });

    return user;
};


module.exports = {
    createUser,
    getUserByEmail,
    getUserByUsername
};
