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

    async run(guild, invite) {
        if(!guild || !invite) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, guild, invite).catch(() => {});
    }

    async Logger(GuildDB, guild, invite) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const author = {};
            const fields = new Array();
            
            /* Inviter */
            if(invite.inviter) {
                author.name = `${invite.inviter.username}#${invite.inviter.discriminator}`;
                author.icon_url = invite.inviter.avatar ?
                    `https://cdn.discordapp.com/avatars/${invite.inviter.id}/${invite.inviter.avatar}` :
                    `https://cdn.discordapp.com/embed/avatars/${invite.inviter.discriminator % 4}.png`;
            }

            /* Channel */
            if(invite.channel) {
                const channel = guild.channels.get(invite.channel);
                fields.push({
                    name: `Channel`,
                    value: `${channel ? channel.name : (invite.channel.name || invite.channel.id)}`,
                    inline: true
                });
            }

            /* Maximum Uses */
            if(invite.maxUses) fields.push({
                name: `Maximum Uses`,
                value: `${invite.maxUses}`,
                inline: true
            });

            /* Maximum Age */
            fields.push({
                name: `Maximum Age`,
                value: `${invite.maxAge ? `${moment.duration(invite.maxAge * 1000).format(`DD [days] HH [hours] mm [minutes] ss [seconds]`)}` : "Doesn\'t Expire"}`,
                inline: true
            });

            /* Temporary Membership */
            fields.push({
                name: `Temporary Membership`,
                value: `${invite.temporary ? "Yes" : "No"}`,
                inline: true
            });

            /* Uses */
            fields.push({
                name: `Uses`,
                value: `${invite.uses ? `${invite.uses} Uses` : "No Uses"}`,
                inline: true
            });

            const payload = {
                embeds: [
                    {
                        title: `Invite Created - ${invite.code}`,
                        author,
                        fields,
                        color: this.client.utils.colors.green,
                        timestamp: new Date,
                        footer: {
                            text: `Invite: https://discord.gg/${invite.code}`
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