/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const _ =require("lodash");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message, oldMessage) {
        if(!message || !message.channel || !message.channel.guild) return;
        const cachedGuild = this.client.cache.messages.get(message.channel.guild.id);
        const cachedMessage = cachedGuild ? cachedGuild.find(x => x.messageID == message.id) : undefined;
        if(!oldMessage && cachedMessage) oldMessage = cachedMessage;
        if(!oldMessage) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: message.channel.guild.id } });
        this.Logger(GuildDB, message, oldMessage).catch((e) => {});
        if(message.content && oldMessage.content && message.author.id) this.sniper(message, oldMessage);
    }

    async Logger(GuildDB, message, oldMessage) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = message.channel.guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const fields = new Array();

            /* Content */
            if(message.content !== oldMessage.content) {
                fields.push({
                    name: `Content (Before)`,
                    value: `${oldMessage.content.shorten(997)}`,
                    inline: true
                });

                fields.push({
                    name: `Content (After)`,
                    value: `${message.content.shorten(997)}`,
                    inline: true
                });
            }

            if(oldMessage.hasOwnProperty("pinned") || message.hasOwnProperty("pinned")) fields.push({
                name: `Pinned`,
                value: [
                    `**Before:** ${oldMessage.pinned ? "Yes" : "No"}`,
                    `**After:** ${message.pinned ? "Yes" : "No"}`
                ].join("\n")
            });

            const payload = {
                embeds: [
                    {
                        title: `Message Edited in #${message.channel.name}`,
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: message.author.avatar ?
                            `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${message.author.discriminator % 4}.png`
                        },
                        color: this.client.utils.colors.yellow,
                        timestamp: new Date,
                        fields,
                        footer: {
                            text: `ID: ${message.id}`
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

    async sniper(message, oldMessage) {
        const key = {
            channelID: `${message.channel.id}`,
            guildID: `${message.channel.guild.id}`
        };
        let ChannelDB = await this.client.database.TextChannel.findOne({ where: key });
        if(!ChannelDB) ChannelDB = await this.client.database.TextChannel.create(key);
        if(!message.content || !message.author || !message.author.id) return;
        ChannelDB.dataValues.lastDeleted = {
            content: message.content,
            oldContent: oldMessage.content,
            authorID: message.author.id
        };
        this.client.database.TextChannel.update({ lastEdited: ChannelDB.dataValues.lastDeleted }, { where: key })
        .catch(() => {});
    }
    
}