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

    async run(message) {
        if(!message || !message.channel || !message.channel.guild) return;
        const cachedGuild = this.client.cache.messages.get(message.channel.guild.id);
        const cachedMessage = cachedGuild ? cachedGuild.find(x => x.messageID == message.id) : undefined;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: message.channel.guild.id } });
        if(!cachedMessage) {
            return;
        } else {
            message.author = await this.client.fetchUser(cachedMessage.userID);
            message.content = cachedMessage.content;
            this.sniper(message);
            this.Logger(GuildDB, message).catch(() => {});
        }
    }

    async Logger(GuildDB, message) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = message.channel.guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const payload = {
                embeds: [
                    {
                        title: `Message Deleted in #${message.channel.name}`,
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: message.author.avatar ?
                            `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${message.author.discriminator % 4}.png`
                        },
                        color: this.client.utils.colors.red,
                        timestamp: new Date,
                        fields: [
                            {
                                name: `Content`,
                                value: `${message.content.shorten(997)}`
                            }
                        ],
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

    async sniper(message) {
        const key = {
            channelID: `${message.channel.id}`,
            guildID: `${message.channel.guild.id}`
        };
        let ChannelDB = await this.client.database.TextChannel.findOne({ where: key });
        if(!ChannelDB) ChannelDB = await this.client.database.TextChannel.create(key);
        if(!message.content || !message.author || !message.author.id) return;
        ChannelDB.dataValues.lastDeleted = {
            content: message.content,
            authorID: message.author.id
        };
        this.client.database.TextChannel.update({ lastDeleted: ChannelDB.dataValues.lastDeleted }, { where: key })
        .catch(() => {});
    }
    
}