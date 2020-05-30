/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Guild', {
        guildID: {
            type: Sequelize.STRING,
            unique: 'Guild'
        },
        description: {
            type: Sequelize.TEXT
        },
        enabled: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: true
        },
        muteRole: Sequelize.STRING,
        prefix: {
            type: Sequelize.STRING,
            defaultValue: 's&',
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
        expChannel: Sequelize.STRING,
        expThreshold: {
            type: Sequelize.NUMBER,
            defaultValue: 2,
            allowNull: false,
            validate: {
                max: 10,
                min: 1
            }
        },
        expCooldown: {
            type: Sequelize.NUMBER,
            defaultValue: 30,
            allowNull: false
        },
        expMessage: {
            type: Sequelize.JSON,
            defaultValue: {
                content: '🎉 {{user}} You just leveled up to Level **{{level}}**!'
            },
            allowNull: false
        },
        modLogsChannel: Sequelize.STRING,
        welcomer: Sequelize.JSON,
        farewell: Sequelize.JSON,
        moderation: Sequelize.JSON,
        autoRoles: Sequelize.JSON,
        autoMod: Sequelize.JSON,
        starboard: Sequelize.JSON,
        serverLogs: Sequelize.STRING,
        disabledModules: {
            type: Sequelize.JSON,
            defaultValue: ['level'],
            allowNull: false
        },
        disabledCommands: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
        birthday: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        joinLock: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        memberLeaveLogs: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },
        guildnames: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        }
    });
};