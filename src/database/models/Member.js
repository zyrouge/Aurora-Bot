/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Member', {
        userID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'Member'
        },
        guildID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'Member'
        },
        afk: Sequelize.JSON,
        expPoints: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: '0'
        },
        expLevel: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: '0'
        },
        blacklisted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        warnings: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
        nicknames: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
    });
};