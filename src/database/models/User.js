/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('User', {
        userID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'User'
        },
        nickname: {
            type: Sequelize.STRING
        },
        about: {
            type: Sequelize.STRING
        },
        birthDate: {
            type: Sequelize.DATEONLY
        },
        marriedTo: {
            type: Sequelize.STRING
        },
        pocketCash: {
            type: Sequelize.TEXT, 
            defaultValue: '0',
            allowNull: false
        },
        safeCash: {
            type: Sequelize.TEXT,
            defaultValue: '0',
            allowNull: false
        },
        pocketGold: {
            type: Sequelize.TEXT, 
            defaultValue: '0',
            allowNull: false
        },
        safeGold: {
            type: Sequelize.TEXT,
            defaultValue: '0',
            allowNull: false
        },
        items: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
        streak: {
            type: Sequelize.TEXT,
            defaultValue: '0',
            allowNull: false
        },
        bounty: {
            type: Sequelize.TEXT,
            defaultValue: '0',
            allowNull: false
        },
        color: {
            type: Sequelize.STRING
        },
        cooldowns: {
            type: Sequelize.JSON,
            defaultValue: {},
            allowNull: false
        },
        usernames: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
        delResp: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        delMS: {
            type: Sequelize.NUMBER,
            defaultValue: 10000,
            allowNull: false
        },
        todo: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        }
    });
};