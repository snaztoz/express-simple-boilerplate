'use strict';

const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define association here
        }
    };

    User.init({
        username: {
            type: DataTypes.STRING(60),
            unique: true,
            allowNull: false,
            validate: {
                // Username hanya diperbolehkan terdiri atas karakter
                // alfanumerik dan underscore.
                // Juga, username tidak diperbolehkan hanya terdiri atas
                // satu atau lebih underscore.
                is: /(?:_?[a-z0-9]+)[a-z0-9_]*/i,
                notNull: true,
                notEmpty: true,
            },
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
                notNull: true,
                notEmpty: true,
            },
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            },
        },
    }, {
        sequelize,
        modelName: 'User',
    });

    return User;
};