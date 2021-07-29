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


module.exports = router;
