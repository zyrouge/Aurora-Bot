/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Utils } = require("aurora") || global.Aurora;

const AFKDisplayer = async (client, message, responder, translator) => {
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
                            description: translator.translate("USER_AFK", user.username, user.discriminator, afk.message),
                            color: Utils.colors.fuschia
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
                        msg.delete(translator.translate("AFK")).catch(() => {});
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
                nick: `${message.member.nick ? message.member.nick.split(`[${translator.translate("AFK")}]`).join("").trim() : message.username}`
            }, translator.translate("AFK")).catch(() => {});
            const fields = new Array();
            afk.pings.splice(0, 5).forEach(ping => {
                const user = client.users.get(ping.id);
                fields.push({
                    name: translator.translate("AFK_LOG_MSG", (user ? `${user.username}#${user.discriminator}` : ping.id), moment(ping.time).format("dddd, MMMM Do YYYY, h:mm:ss a")),
                    value: translator.translate("CONTENT", ping.message)
                });
            });
            message.channel.createMessage({
                embed: client.embeds.embed(message.author, {
                    description: translator.translate("AFK_REMOVED", fields.length),
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