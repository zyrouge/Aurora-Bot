/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(channel) {
        if(!channel || !channel.guild) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: channel.guild.id } });
        this.Logger(GuildDB, channel).catch(() => {});
    }

    async Logger(GuildDB, channel) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = channel.guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const fields = new Array();
            let author = {};

            /* Type */
            const channelTypes = [
                "Text Channel",
                "DM",
                "Voice Channel",
                "Group DM",
                "Category",
                "News Channel",
                "Store Channel"
            ];
            fields.push({
                name: `Type`,
                value: `${channelTypes[channel.type] || "Unknown"} ${channel.nsfw ? "[NSFW]" : ""}`,
                inline: true
            });

            /* Topic */
            if(channel.topic) fields.push(
                {
                    name: `Topic`,
                    value: `${channel.topic}`,
                    inline: true
                }
            );

            /* Position */
            fields.push({
                name: `Position`,
                value: `${channel.position}`,
                inline: true
            });

            /* Parent */
            const parent = channel.guild.channels.get(channel.parentID);
            if(parent) {
                fields.push({
                    name: `Parent`,
                    value: `${parent.name}`,
                    inline: true
                });
            }

            /* Audit Logs */
            const auditLogs = await channel.guild.getAuditLogs(10, undefined, 10);
            const audit = auditLogs && auditLogs.entries ?
                auditLogs.entries.sort((a, b) => b.id - a.id).find(log => log.targetID == channel.id) : undefined;
            if(audit && audit.user) {
                author.name = `${audit.user.username}#${audit.user.discriminator}`;
                author.icon_url = audit.user.avatar ?
                `https://cdn.discordapp.com/avatars/${audit.user.id}/${audit.user.avatar}` :
                `https://cdn.discordapp.com/embed/avatars/${audit.user.discriminator % 4}.png`
            }

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const payload = {
                embeds: [
                    {
                        title: `Channel Created - #${channel.name}`,
                        author,
                        color: this.client.utils.colors.green,
                        timestamp: new Date,
                        fields,
                        footer: {
                            text: `ID: ${channel.id}`
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
                        guildID: channel.guild.id,
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