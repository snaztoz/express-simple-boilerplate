const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING(60),
            unique: true,
            allowNull: false,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    });

    return User;
};
