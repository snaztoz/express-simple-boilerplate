const bcrypt = require('bcrypt');

const { promisified } = require('../utils');
const { sequelize } = require('../models');


const SALT_ROUNDS = 10;

const createJwtFor = async (username) => {
    return await promisified.jwt.sign(
        { username },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
};

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

const verifyJwt = async (token) => {
    return await promisified.jwt.verify(token, process.env.JWT_SECRET);
};


module.exports = {
    createJwtFor,
    createUser,
    getUserByEmail,
    getUserByUsername,
    verifyJwt,
};
