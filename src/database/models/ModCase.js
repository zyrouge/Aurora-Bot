/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('ModCase', {
        guildID: {
            type: Sequelize.STRING
        },
        caseID: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: 'ModCase'
        },
        reason: {
            type: Sequelize.STRING,
            allowNull: false,
            default: 'No Reason was provided'
        },
        messageID: {
            type: Sequelize.STRING,
            unique: 'ModCase'
        },
        channelID: {
            type: Sequelize.STRING,
            unique: 'ModCase'
        },
        moderatorID: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
    });
};