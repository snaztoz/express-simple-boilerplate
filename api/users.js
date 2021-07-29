const express = require('express');
const router = express.Router();

const authService = require('../services/auth');


router.post('/signup', async (req, res) => {
    const body = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    }

    for (const field in body)
    {
        if (!body[field])
        {
            res.status(400).send({err: 'missing field', field});
            return;
        }
    }

    const [existsByEmail, existsByUsername] = await Promise.all([
        authService.getUserByEmail(body.email),
        authService.getUserByUsername(body.username),
    ]);

    if (existsByEmail || existsByUsername)
    {
        const whichId = (existsByEmail)
            ? 'email'
            : 'username';
        res.status(403).send({err: `${whichId} already exists`});
        return;
    }

    const { username } = await authService.createUser(
        body.email,
        body.username,
        body.password
    );

    const token = await authService.createJwtFor(username);

    res.status(201).send({ token });
});

// Fungsi dari route ini yakni untuk memeriksa apakah
// sebuah token yang dimiliki oleh klien valid atau tidak.
//
// Baik valid maupun tidaknya sebuah token, status yang
// akan dikembalikan tetap 200, hanya saja beserta dengan
// JSON yang berisikan informasi mengenai valid tidaknya
// token tersebut.
router.post('/verify', async (req, res) => {
    const token = req.body.token;
    if (!token)
    {
        res.status(401).send({err: 'missing token'});
        return;
    }

    let valid;

    try
    {
        await authService.verifyJwt(token);
        valid = true;
    }
    catch (_)
    {
        valid = false;
    }

    res.status(200).send({ valid });
});


module.exports = router;
