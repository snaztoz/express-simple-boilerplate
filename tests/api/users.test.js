const request = require('supertest');

const app = require('../../app');
const authService = require('../../services/auth');
const { sequelize } = require('../../models');


describe('User API', () => {
    beforeAll(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });

    afterAll(() => {
        return sequelize.close();
    });

    afterEach(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });


    describe('User Verifying', () => {

        it('should fine for normal case', async () => {
            // bypass proses authentikasi
            const validToken = await authService.createJwtFor('test_user');

            const res = await request(app)
                .post('/users/verify')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.valid).toBe(true);
        });

        it('should error when no token is presents', async () => {
            const res = await request(app).post('/users/verify');

            expect(res.status).toBe(400);
        });

        it('should error when Authorization header is invalid', async () => {
            const res = await request(app)
                .post('/users/verify')
                .set('Authorization', 'BlablaFoo ladida haha');

            expect(res.status).toBe(400);
        });

        it('should returns proper result when token is invalid', async () => {
            const res = await request(app)
                .post('/users/verify')
                .set('Authorization', `Bearer LolSomeInvalidTokenGoBrrrrr`);

            expect(res.status).toBe(200);
            expect(res.body.valid).toBe(false);
        });
    });

    describe('User Signup', () => {

        it('should fine when signing up a non-existing user', async () => {
            const username = 'test_user';

            const res = await request(app)
                .post('/users/signup')
                .send({
                    username,
                    email: 'test@email.com',
                    password: 'password'
                });

            expect(res.status).toBe(201);

            const token = res.body.token;
            const decodedPayload = await authService.verifyJwt(token);

            expect(decodedPayload.username).toBe(username);
        });

        it('should error when signing up with incomplete data', async () => {
            const cases = [
                {
                    missing: 'username',
                    data: {
                        email: 'test@email.com',
                        password: 'password',
                    },
                },
                {
                    missing: 'email',
                    data: {
                        username: 'test_user',
                        password: 'password',
                    },
                },
                {
                    missing: 'password',
                    data: {
                        email: 'test@email.com',
                        username: 'test_user',
                    },
                },
            ];

            for (const c of cases)
            {
                const res = await request(app)
                    .post('/users/signup')
                    .send(c.data);

                expect(res.status).toBe(400);
                expect(res.body.err).toBe('missing field');
                expect(res.body.field).toBe(c.missing);
            }
        });

        it('should error when the ids are already taken', async () => {
            const cases = [
                {
                    duplicated: 'email',
                    data: {
                        email: 'test@email.com',
                        username: 'foo',
                        password: 'password',
                    },
                    dummyDataCreation: async () => {
                        await authService.createUser(
                            'test@email.com',
                            'test_user',
                            'password'
                        );
                    }
                },
                {
                    duplicated: 'username',
                    data: {
                        email: 'foo@email.com',
                        username: 'test_user',
                        password: 'password',
                    },
                    dummyDataCreation: async () => {
                        await authService.createUser(
                            'test@email.com',
                            'test_user',
                            'password'
                        );
                    }
                }
            ];

            for (const c of cases)
            {
                await c.dummyDataCreation();

                const res = await request(app)
                    .post('/users/signup')
                    .send(c.data);

                expect(res.status).toBe(403);
                expect(res.body.err).toBe(`${c.duplicated} already exists`);

                // clean-up setelah test case
                await sequelize.models.User.destroy({ truncate: true });
            }
        });
    });

    describe('User Login', () => {

        it('should log user in when the credentials are correct', async () => {
            // dummy user
            await authService.createUser(
                'test@email.com',
                'test_user',
                'password'
            );

            const cases = [
                {
                    data: {
                        id: 'test@email.com',
                        password: 'password',
                    }
                },
                {
                    data: {
                        id: 'test_user',
                        password: 'password',
                    }
                },
            ]

            for (const c of cases)
            {
                const res = await request(app)
                    .post('/users/login')
                    .send(c.data);

                expect(res.status).toBe(200);

                const decoded = await authService.verifyJwt(res.body.token);
                expect(decoded.username).toBe('test_user');
            }
        });

        it('should returns error when the credentials are missing', async () => {
            const cases = [
                {
                    missing: 'id',
                    data: {
                        password: 'password',
                    },
                },
                {
                    missing: 'password',
                    data: {
                        id: 'test_user',
                    },
                }
            ];

            for (const c of cases)
            {
                const res = await request(app)
                    .post('/users/login')
                    .send(c.data);

                expect(res.status).toBe(400);
                expect(res.body.err).toBe('missing field');
                expect(res.body.field).toBe(c.missing);
            }
        });

        it('should returns error when user not exists', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    id: 'test_user',
                    password: 'password'
                });

            expect(res.status).toBe(403);
            expect(res.body.err).toBe('user not exists');
        });

        it('should returns error when the password is wrong', async () => {
            // dummy user
            await authService.createUser(
                'test@email.com',
                'test_user',
                'password'
            );

            const res = await request(app)
                .post('/users/login')
                .send({
                    id: 'test_user',
                    password: 'wrong!!!'
                });

            expect(res.status).toBe(403);
            expect(res.body.err).toBe('incorrect password');
        });
    });
});
