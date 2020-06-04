/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const _ = require("lodash");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(channel, oldChannel) {
        if(!channel || !channel.guild) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: channel.guild.id } });
        this.Logger(GuildDB, channel, oldChannel).catch(() => {});
    }

    async Logger(GuildDB, channel, oldChannel) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = channel.guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const fields = new Array();
            let author = {};

            /* Name */
            if(channel.name !== oldChannel.name) fields.push({
                name: `Name`,
                value: [
                    `**Before:** ${oldChannel.name}`,
                    `**After:** ${channel.name}`
                ].join("\n"),
                inline: true
            });

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
            if(channel.type !== oldChannel.type || channel.nsfw !== oldChannel.nsfw) {
                fields.push({
                    name: `Type`,
                    value: [
                        `**Before:** ${channelTypes[oldChannel.type] || "Unknown"} ${oldChannel.nsfw ? "[NSFW]" : ""}`,
                        `**After:** ${channelTypes[channel.type] || "Unknown"} ${channel.nsfw ? "[NSFW]" : ""}`
                    ].join("\n"),
                    inline: true
                });
            }

            /* Topic */
            if(channel.topic !== oldChannel.topic) fields.push({
                name: `Topic`,
                value: [
                    `**Before:** ${oldChannel.topic || "None"}`,
                    `**After:** ${channel.topic || "None"}`
                ].join("\n"),
                inline: true
            });

            /* Position */
            if(channel.position !== oldChannel.position) fields.push({
                name: `Position`,
                value: [
                    `**Before:** ${oldChannel.position}`,
                    `**After:** ${channel.position}`
                ].join("\n"),
                inline: true
            });

            /* Bitrate */
            if(channel.bitrate && oldChannel.bitrate && channel.bitrate !== oldChannel.bitrate) fields.push({
                name: `Bitrate`,
                value: [
                    `**Before:** ${oldChannel.bitrate || "None"}`,
                    `**After:** ${channel.bitrate || "None"}`
                ].join("\n"),
                inline: true
            });

            /* Parent */
            const parent = channel.guild.channels.get(channel.parentID);
            const oldParent = channel.guild.channels.get(oldChannel.parentID);
            if(channel.parentID !== oldChannel.parentID) {
                fields.push({
                    name: `Parent`,
                    value: [
                        `**Before:** ${oldParent ? oldParent.name : (oldChannel.parentID || "None")}`,
                        `**After:** ${parent ? parent.name : (channel.parentID || "None")}`
                    ].join("\n"),
                    inline: true
                });
            }

            /* Audit Logs */
            const auditLogs = await channel.guild.getAuditLogs(10, undefined, 11);
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
                        title: `Channel Updated - #${channel.name}`,
                        author,
                        color: this.client.utils.colors.yellow,
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