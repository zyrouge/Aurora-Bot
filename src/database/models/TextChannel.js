/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('TextChannel', {
        channelID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'TextChannel'
        },
        guildID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'TextChannel'
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
        },
        webhookURL: Sequelize.STRING,
        lastDeleted: Sequelize.JSON,
        lastEdited: Sequelize.JSON
    });
};