/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('ReactionRole', {
        guildID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        channelID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        messageID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        mutual: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        roles: {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: []
        }
    });
};