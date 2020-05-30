/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const AFKDisplayer = async (client, message) => {
    return new Promise(async (resolve, reject) => {
        if(message.mentions.length > 0) {
            message.mentions.forEach(async user => {
                const key = {
                    userID: `${user.id}`,
                    guildID: `${message.channel.guild.id}`
                };
                const memberDB = await client.database.Member.findOne({
                    where: key
                });
                if(memberDB && memberDB.dataValues && memberDB.dataValues.afk) {
                    const afk = memberDB.dataValues.afk;
                    const msg = await message.channel.createMessage({
                        embed: {
                            description: `**${user.username}#${user.discriminator}** is Currently AFK. Reason: **${afk.message}**`,
                            color: client.utils.colors.fuschia
                        }
                    });
                    afk.pings.push({
                        id: `${message.author.id}`,
                        message: message.content && message.content > 100 ? message.content.substr(0, 100) + "..." : message.content,
                        time: Date.now()
                    });
                    client.database.Member.update({
                        afk
                    }, { where: key });
                    setTimeout(() => {
                        msg.delete("AFK").catch(() => {});
                    }, 5000);
                }
            });
        }
        resolve(true);
    });
};

const AFKRemover = async (client, message) => {
    return new Promise(async (resolve, reject) => {
        const moment = require("moment");
        const key = {
            userID: `${message.author.id}`,
            guildID: `${message.channel.guild.id}`
        };
        const memberDB = await client.database.Member.findOne({
            where: key
        });
        if(memberDB && memberDB.dataValues && memberDB.dataValues.afk) {
            const afk = memberDB.dataValues.afk;
            const GuildMe = message.channel.guild.members.get(client.user.id);
            if(GuildMe && GuildMe.permission.json.manageNicknames) message.member.edit({
                nick: `${message.member.nick ? message.member.nick.split("[AFK]").join("").trim() : message.username}`
            }, "AFK").catch(() => {});
            const fields = new Array();
            afk.pings.splice(0, 5).forEach(ping => {
                const user = client.users.get(ping.id);
                fields.push({
                    name: `${user ? `${user.username}#${user.discriminator}` : ping.id} on ${moment(ping.time).format("dddd, MMMM Do YYYY, h:mm:ss a")}`,
                    value: `**Content:** ${ping.message}`
                });
            });
            message.channel.createMessage({
                embed: client.embeds.embed(message.author, {
                    description: `${client.emojis.tick} Removed Your AFK. ${fields.length ? `You were pinged **${fields.length}** times.\nLogs:` : ""}`,
                    fields
                })
            });
            client.database.Member.update({
                afk: null
            }, { where: key });
            resolve(true);
        } else resolve(false);
    });
};

module.exports = async (...args) => {
    const result = await AFKRemover(...args);
    await AFKDisplayer(...args);
    return result;
}

module.exports.command = "afk";