const { ValidationError } = require('sequelize');

const { sequelize } = require('../../models');


describe('User Model', () => {
    beforeAll(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });

    afterAll(() => {
        return sequelize.close();
    });

    afterEach(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });


    test('username validations', async () => {
        // normal user
        const username = '__test_user_123___';
        const user = await sequelize.models.User.create({
            username,
            email: 'some.email@email.com',
            password: 'password',
        });
        expect(user.username).toBe(username);

        // underscore-only (illegal)
        try
        {
            await sequelize.models.User.create({
                username: '____',
                email: 'underscore@email.com',
                password: 'password',
            });
            fail('expecting underscore-only username to throws error');
        }
        catch (err)
        {
            expect(err).toBeInstanceOf(ValidationError);
        }

        // empty username (illegal)
        try
        {
            await sequelize.models.User.create({
                username: '',
                email: 'empty@email.com',
                password: 'password',
            });
            fail('expecting empty username to throws error');
        }
        catch (err)
        {
            expect(err).toBeInstanceOf(ValidationError);
        }
    });
});
