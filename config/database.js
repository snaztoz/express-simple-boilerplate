/**
 * Untuk konfigurasi tiap opsi database development, berikan
 * key dengan prefix 'DB_' pada file .env.
 *
 *  contoh:
 *      DB_USERNAME=foo
 *
 *
 * Untuk konfigurasi opsi database test, berikan prefix key
 * 'DB_TEST_'.
 *
 *  contoh:
 *      DB_TEST_USERNAME=test_user
 *
 *
 * Untuk konfigurasi opsi database production, berikan prefix
 * key 'DB_PROD_'.
 *
 *  contoh:
 *      DB_PROD_USERNAME=production_user
 *
 *
 * Jika value untuk environment test atau production tidak
 * diberikan, maka ia akan menggunakan value yang ada pada
 * environment default (development).
 *
 * Khusus konfigurasi nama database, jika value pada environment
 * test atau production tidak diberikan, maka ia akan menggunakan
 * nama database pada environment development, yang kemudian
 * diberikan suffix '_test' atau '_prod'.
 *
 *  contoh:
 *      'blog_db' menjadi 'blog_db_test' pada env test
 *
 *
 * Untuk daftar konfigurasi yang tersedia, terdapat pada
 * konstan `options` di bawah (buat menjadi uppercase di
 * dalam file .env).
 */

const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
});


const options = [
    'dialect',
    'database',
    'username',
    'password',
    'host',
    'port',
];

const development = {};
const test = {};
const production = {};

for (const option of options)
{
    // setting development adalah setting default
    development[option] = process.env[`DB_${option.toUpperCase()}`];
    test[option]        = development[option];
    production[option]  = development[option];

    if (option === 'database')
    {
        test[option] += '_test';
        production[option] += + '_prod';
    }

    test[option] = process.env[`DB_TEST_${option.toUpperCase()}`] ?? test[option];
    production[option] = process.env[`DB_PROD_${option.toUpperCase()}`] ?? production[option];
}


module.exports = {
    development,
    test,
    production,
};
