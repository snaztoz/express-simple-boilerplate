const bcrypt = require('bcrypt');

const { sequelize } = require('../../models');
const {
    createUser,
    getUserByEmail,
    getUserByUsername
} = require('../../services/auth');


describe('Auth Service', () => {
    beforeAll(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });

    afterAll(() => {
        return sequelize.close();
    });

    afterEach(() => {
        return sequelize.models.User.destroy({ truncate: true });
    });


    it('should fine when create a non-existing user', async () => {
        const email = 'some.email@email.com';

        const user = await createUser(
            email,
            'test_user',
            'password'
        );

        expect(user.email).toBe(email);
    });

    it('should error when creating duplicated user', async () => {
        const email = 'some.email@email.com';

        await createUser(email, 'test_user_1', 'password');

        try
        {
            await createUser(email, 'test_user_2', 'password');
            fail('expecting duplicate users creation to be an error');
        }
        catch (err)
        {
            expect(err.name).toBe('SequelizeUniqueConstraintError');
        }
    });

    it('should hash password when creating new user', async () => {
        const password = 'password';

        const user = await createUser('test@email.com', 'test_user', password);

        expect(user.password).not.toBe(password);

        const isHashedProperly = await bcrypt.compare(password, user.password);
        expect(isHashedProperly).toBe(true);
    });

    it('should returns valid user if exists (getUserByEmail)', async () => {
        const email = 'some.email@email.com';

        await createUser(email, 'test_user', 'password');

        const user = await getUserByEmail(email);
        expect(user.email).toBe(email);

        const nonExistingUser = await getUserByEmail('foo@email.com');
        expect(nonExistingUser).toBeNull();
    });

    it('should returns valid user if exists (getUserByUsername)', async () => {
        const username = 'test_user';

        await createUser('test@email.com', username, 'password');

        const user = await getUserByUsername(username);
        expect(user.username).toBe(username);

        const nonExistingUser = await getUserByUsername('foo');
        expect(nonExistingUser).toBeNull();
    });
});
