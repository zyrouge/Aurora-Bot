/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild, member) {
        let GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        if(GuildDB) {
            this.updateMemberRemove(GuildDB, guild, member);
        }
        this.Logger(GuildDB, guild, member).catch((e) => {console.error(e);
        });
    }

    async Logger(GuildDB, guild, member) {console.log(member.joinedAt)
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const fields = new Array();

            if(!member.user) member.user = await this.client.fetchUser(member.id).catch(() => {});
            if(!member.user) return;

            if(member.joinedAt) {
                fields.push({
                    name: `Joined On`,
                    value: `${moment(member.joinedAt).tz('Atlantic/Azores').format(`DD-MM-YYYY HH:mm:ss`)} UTC`
                })
            }

            const payload = {
                embeds: [
                    {
                        title: `Member Left - ${member.user.username}`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator}`,
                            icon_url: member.user.avatar ?
                                `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` :
                                `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 4}.png`
                        },
                        thumbnail: { url: member.user.avatar ?
                            `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 4}.png`
                        },
                        fields,
                        color: this.client.utils.colors.red,
                        timestamp: new Date,
                        footer: {
                            text: `ID: ${member.user.id}`
                        }
                    }
                ],
                username: `${this.client.user.username} - Logging`,
                avatar_url: `${this.client.user.avatarURL}`
            };
            WebhookSender(webhookURL, payload)
            .catch((e) => {
                if(e.toJSON().message == 'Request failed with status code 404') {
                    this.client.database.TextChannel.update({
                        webhookURL: null
                    }, { where: {
                        guildID: guild.id,
                        channelID: GuildDB.dataValues.serverLogs
                    } }).catch(() => {});
                }
            });
        }
    }

    getHook(channel, GuildDB) {
            return new Promise(async (resolve, reject) => {
                try {
                    let webhookURL;
                    let TextChannelDB = await this.client.database.TextChannel.findOne({ where: {
                        guildID: channel.guild.id,
                        channelID: GuildDB.dataValues.serverLogs
                    } });
        
                    /* No TextChannel Data */
                    if(!TextChannelDB || !TextChannelDB.dataValues) {
                        TextChannelDB = await this.client.database.TextChannel.create({
                            guildID: channel.guild.id,
                            channelID: GuildDB.dataValues.serverLogs
                        });
                    }
                    
                    if(TextChannelDB && TextChannelDB.dataValues && TextChannelDB.dataValues.webhookURL) {
                        resolve(TextChannelDB.dataValues.webhookURL);
                    } else {
                        let webhooks = await channel.getWebhooks();
                        let webhook = webhooks.find(x => String(x.name).toLowerCase().includes("aurora"));
                        if(!webhook) {
                            webhook = await channel.createWebhook({
                                name: `Aurora - Logging`,
                                avatar: `${this.client.user.avatarURL}`
                            });
                        }
                        if(!webhook.id || !webhook.token) reject();
                        TextChannelDB.dataValues.webhookURL = `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`;
                        TextChannelDB = await this.client.database.TextChannel.update({
                            webhookURL: `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`
                        }, { where: {
                            guildID: channel.guild.id,
                            channelID: GuildDB.dataValues.serverLogs
                        } });
                        webhookURL = `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`;
                        resolve(webhookURL);
                    }
                } catch(e) {
                    reject(e);
                }
            });
        }

    updateMemberRemove(_GuildDB, guild, member) {
        let GuildDB = _GuildDB;
        if(!GuildDB || !GuildDB.dataValues || !GuildDB.dataValues.memberLeaveLogs) return;
        if(GuildDB.dataValues.memberLeaveLogs.map(x => x.id).includes(member.id)) {
            GuildDB.dataValues.memberLeaveLogs = GuildDB.dataValues.memberLeaveLogs.filter(x => x.id !== member.id);
        }
        GuildDB.dataValues.memberLeaveLogs.push({
            id: member.id,
            time: Date.now()
        });
        this.client.database.Guild.update({
            memberLeaveLogs: GuildDB.dataValues.memberLeaveLogs
        }, { where: { guildID: guild.id } }).catch(() => {});
    }
}