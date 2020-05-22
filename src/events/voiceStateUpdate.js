/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const _ =require("lodash");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member, oldState) {
        if(!member || !oldState) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: member.guild.id } });
        this.Logger(GuildDB, member, oldState).catch((e) => {console.error(e);
        });
    }

    async Logger(GuildDB, member, oldState) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = member.guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const fields = new Array();
            const newState = member.voiceState;

            /* Mute */
            if(oldState.mute !== newState.mute) fields.push({
                name: `Server Mute`,
                value: [
                    `**Before:** ${oldState.mute ? "Yes" : "No"}`,
                    `**After:** ${newState.mute ? "Yes" : "No"}`
                ].join("\n")
            });

            /* Deafen */
            if(oldState.deaf !== newState.deaf) fields.push({
                name: `Server Deafen`,
                value: [
                    `**Before:** ${oldState.deaf ? "Yes" : "No"}`,
                    `**After:** ${newState.deaf ? "Yes" : "No"}`
                ].join("\n")
            });

            /* Self-Mute */
            if(oldState.selfMute !== newState.selfMute) fields.push({
                name: `Self Mute`,
                value: [
                    `**Before:** ${oldState.selfMute ? "Yes" : "No"}`,
                    `**After:** ${newState.selfMute ? "Yes" : "No"}`
                ].join("\n")
            });
            
            /* Self-Deaf */
            if(oldState.selfDeaf !== newState.selfDeaf) fields.push({
                name: `Self Defean`,
                value: [
                    `**Before:** ${oldState.selfDeaf ? "Yes" : "No"}`,
                    `**After:** ${newState.selfDeaf ? "Yes" : "No"}`
                ].join("\n")
            });

            /* Self-Stream */
            if(oldState.selfStream !== newState.selfStream) fields.push({
                name: `Stream`,
                value: [
                    `**Before:** ${oldState.selfStream ? "Yes" : "No"}`,
                    `**After:** ${newState.selfStream ? "Yes" : "No"}`
                ].join("\n")
            });
            
            const payload = {
                embeds: [
                    {
                        title: `Member Voice State Changed`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator}`,
                            icon_url: member.user.avatar ?
                            `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 4}.png`
                        },
                        fields,
                        color: this.client.utils.colors.yellow,
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
                        guildID: newChannel.guild.id,
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