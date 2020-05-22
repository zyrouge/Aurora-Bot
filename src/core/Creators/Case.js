/** 
 * @author ZYROUGE
 * @license MIT
*/

const sendCase = async (client, guild, modCase, _GuildDB) => {
    return new Promise(async (resolve, reject) => {
        try {
            let GuildDB = _GuildDB;
            if(!GuildDB) {
                GuildDB = await client.database.Guild.findOne({ where: {
                    guildID: guild.id
                } });
                if(!GuildDB) {
                    GuildDB = await client.database.Guild.create({
                        guildID: guild.id
                    });
                }
            }
            if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.modLogsChannel) {
                const channel = guild.channels.get(`${GuildDB.dataValues.modLogsChannel}`);
                if(!channel) resolve();
                const Moderator = guild.members.get(`${modCase.moderatorID}`);
                const User = client.users.get(`${modCase.affected}`);
                const msg = await channel.createMessage({
                    embed: {
                        title: `Case ${modCase.caseID} | ${modCase.type}`,
                        description: [
                            `**Affected:** ${User ? `${User.username}#${User.discriminator} (${User.id})` : modCase.affected}`,
                            `**Moderator:** ${Moderator ? `${Moderator.username}#${Moderator.discriminator} (${Moderator.id})` : modCase.moderator}`,
                            `**Reason:** ${modCase.reason}`
                        ].join("\n"),
                        color: 0xFF0000,
                        timestamp: new Date()
                    }
                }).catch(e => reject(e));
                resolve(msg);
            } else {
                resolve();
            }
        } catch(e) {
            reject(e);
        }
    });
};

const createCase = async (client, guild, modCase) => {
    return new Promise(async (resolve, reject) => {
        try {
            let GuildDB = await client.database.Guild.findOne({ where: {
                guildID: guild.id
            } });
            if(!GuildDB) {
                GuildDB = await client.database.Guild.create({
                    guildID: guild.id
                });
            }
            let LastestCase = await client.database.ModCase.findOne({ where: {
                    guildID: guild.id
                }, order: [ [ 'createdAt', 'DESC' ] ],
            });
            const latestCaseNumber = LastestCase && LastestCase.dataValues && LastestCase.dataValues.caseID && !isNaN(LastestCase.dataValues.caseID) ? parseInt(LastestCase.dataValues.caseID) + 1 : 1;
            let caseModel = {
                caseID: `${latestCaseNumber}`,
                guildID: guild.id,
                ...modCase,
                messageID: null,
                channelID: null
            };
            const message = await sendCase(client, guild, caseModel, GuildDB).catch(() => {});
            if(message && message.id) caseModel.messageID = `${message.id}`;
            if(message && message.channel && message.channel.id) caseModel.channelID = `${message.channel.id}`;
            await client.database.ModCase.create(caseModel)
            .then((createdCase) => {
                resolve(createdCase);
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = createCase;