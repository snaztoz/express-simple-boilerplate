const mysql = require('mysql2/promise');


let pool;

const init = async () => {
    try
    {
        pool = await mysql.createPool({
            connectionLimit: 10,
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.DATABASE,
        });
    }
    catch (err)
    {
        throw err;
    }
};


module.exports = async () => {
    if (!pool)
    {
        await init();
    }
    return pool;
};
