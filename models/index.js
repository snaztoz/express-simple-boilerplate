module.exports = (sequelize) => {
    return {
        User: require('./user.model')(sequelize),
    };
};
