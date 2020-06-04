/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message, emoji) {
        if(!message) return;
        if(!message.channel.name) {
            const fetched = await this.client.fetchChannel(message.channel.id);
            if(fetched) message.channel = fetched;
        }
        const guild = message.channel.guild;
        if(!guild) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, message, guild, emoji).catch(() => {});
    }

    async Logger(GuildDB, message, guild, emoji) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const fields = new Array();
            
            if(message.channel.name) {
                fields.push({
                    name: `Channel`,
                    value: `#${message.channel.name}`,
                    inline: true
                });
            } else {
                fields.push({
                    name: `Channel ID`,
                    value: `#${message.channel.id}`,
                    inline: true
                });
            }

            if(emoji) {
                if(!emoji.id) fields.push({
                    name: `Emoji (Normal)`,
                    value: `${emoji.name}`,
                    inline: true
                });
                else {
                    const guildEmoji = await this.client.fetchGuildEmoji(guild.id, emoji.id).catch(() => {});

                    if(guildEmoji) fields.push({
                        name: `Emoji (Custom)`,
                        value: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
                    });

                    fields.push({
                        name: `Emoji Name (Custom) ${guildEmoji ? "" : "(External)"}`,
                        value: `${emoji.name} ${emoji.animated ? "(Animated)" : ""}`,
                        inline: true
                    });

                    fields.push({
                        name: `Emoji ID (Custom) ${guildEmoji ? "" : "(External)"}`,
                        value: `${emoji.id}`,
                        inline: true
                    });

                }
            }

            if(message.id && message.channel.id && message.channel.guild.id) {
                fields.push({
                    name: `Message URL`,
                    value: `[Click Here](https://discord.com/channels/${message.channel.guild.id}/${message.channel.id}/${message.id})`,
                    inline: true
                });
            }

            const payload = {
                embeds: [
                    {
                        title: `Message Reactions Removed (Single Reaction)`,
                        fields,
                        color: this.client.utils.colors.red,
                        timestamp: new Date,
                        footer: {
                            text: `${message.id}`
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
    
}