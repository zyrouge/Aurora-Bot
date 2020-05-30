/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Role', {
        roleID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'Role'
        },
        guildID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'Role'
        },
        automod: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        exp: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        blacklisted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};