const request = require('supertest');

const app = require('../../app');
const { sequelize } = require('../../models');
const { createUser } = require('../../services/auth');


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
            expect(res.body.username).toBe(username);
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
                        await createUser('test@email.com', 'test_user', 'password');
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
                        await createUser('test@email.com', 'test_user', 'password');
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
});
