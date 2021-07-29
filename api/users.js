const express = require('express');
const router = express.Router();

const authService = require('../services/auth');


/**
 * Melakukan signup user. Mengembalikan respon JSON yang
 * berisikan token JWT user ketika operasi sukses dilakukan.
 */
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

/**
 * Melakukan login. Mengembalikan respon JSON yang berisikan
 * token JWT dari user ketika login berhasil.
 */
router.post('/login', async (req, res) => {
    const body = {
        id: req.body.id,
        password: req.body.password,
    };

    for (const field in body)
    {
        if (!body[field])
        {
            res.status(400).send({err: 'missing field', field});
            return;
        }
    }

    const isEmail = body.id.includes('@');
    const user = isEmail
        ? await authService.getUserByEmail(body.id)
        : await authService.getUserByUsername(body.id);

    if (!user)
    {
        res.status(403).send({err: 'user not exists'});
        return;
    }

    console.log(user);
    console.log(body.password);

    const isValidLogin = await authService.validateLogin(user, body.password);
    if (!isValidLogin)
    {
        res.status(403).send({err: 'incorrect password'});
        return;
    }

    const token = await authService.createJwtFor(user.username);

    res.status(200).send({ token });
});

/**
 * Memeriksa apakah token yang disimpan user valid atau
 * tidak.
 *
 * Baik valid maupun tidaknya sebuah token, status yang
 * akan dikembalikan tetap 200, hanya saja informasi
 * mengenai valid tidaknya token tersebut akan berbeda di
 * dalam respon JSON yang dihasilkan.
 *
 * Untuk menggunakan route ini, klien harus memasang header
 * Authorization dengan skema "Bearer <token>".
 */
router.post('/verify', async (req, res) => {
    const authHeader = req.get('Authorization');
    if (!authHeader)
    {
        res.status(400).send({err: 'missing token'});
        return;
    }

    const splittedAuthHeader = authHeader.split(' ');
    if (splittedAuthHeader.length != 2 || splittedAuthHeader[0] != 'Bearer')
    {
        res.status(400).send({err: 'invalid Authorization header'});
        return;
    }

    const token = splittedAuthHeader[1];
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
