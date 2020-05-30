/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild, user) {
        if(!guild || !user) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, guild, user).catch(() => {});
    }

    async Logger(GuildDB, guild, user) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const fields = new Array();
            let author = {};

            /* Audit Logs */
            const auditLogs = await guild.getAuditLogs(10, undefined, 23);
            const audit = auditLogs && auditLogs.entries ?
                auditLogs.entries.sort((a, b) => b.id - a.id).find(log => log.targetID == user.id) : undefined;
            if(audit && audit.user) {
                author.name = `${audit.user.username}#${audit.user.discriminator}`;
                author.icon_url = audit.user.avatar ?
                `https://cdn.discordapp.com/avatars/${audit.user.id}/${audit.user.avatar}` :
                `https://cdn.discordapp.com/embed/avatars/${audit.user.discriminator % 4}.png`
            }
            if(audit.reason) {
                fields.push({
                    name: `Reason`,
                    value: `${audit.reason}`
                });
            }

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const payload = {
                embeds: [
                    {
                        title: `Member Unbanned - ${user.username}`,
                        author,
                        thumbnail: { url: user.avatar ?
                            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 4}.png` },
                        color: this.client.utils.colors.green,
                        timestamp: new Date,
                        fields,
                        footer: {
                            text: `ID: ${user.id}`
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
                        guildID: message.channel.guild.id,
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
    
}