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
        if(!guild || !member) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, guild, member).catch((e) => {console.error(e);
        });
    }

    async Logger(GuildDB, guild, member) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const payload = {
                embeds: [
                    {
                        title: `Member Joined - ${member.user.username}`,
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
                        fields: [
                            {
                                name: `Created On`,
                                value: `${moment(member.user.createdAt).tz('Atlantic/Azores').format(`DD-MM-YYYY HH:mm:ss`)} UTC`
                            }
                        ],
                        color: this.client.utils.colors.green,
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
    
}