const { Sequelize } = require('sequelize');

const initModels = require('../models');


const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
});

let isConnected = false;


module.exports = async () => {
    if (!isConnected)
    {
        await sequelize.authenticate();
        initModels(sequelize);
        await sequelize.sync();

        isConnected = true;
    }

    return sequelize.models;
};
