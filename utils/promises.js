const jwt = require('jsonwebtoken');
const util = require('util');


module.exports = {
    jwt: {
        sign: (() => util.promisify(jwt.sign))(),
        verify: (() => util.promisify(jwt.verify))(),
    }
};
