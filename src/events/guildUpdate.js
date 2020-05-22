/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const _ = require("lodash");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild, oldGuild) {
        if(!guild || !oldGuild) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, guild, oldGuild).catch(() => {});
    }

    async Logger(GuildDB, guild, oldGuild) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const author = {};
            const fields = new Array();
            
            /* Audit Logs */
            const auditLogs = await guild.getAuditLogs(10, undefined, 1);
            const audit = auditLogs && auditLogs.entries ?
                auditLogs.entries.sort((a, b) => b.id - a.id).find(log => log.targetID == guild.id) : undefined;
            if(audit && audit.user) {
                author.name = `${audit.user.username}#${audit.user.discriminator}`;
                author.icon_url = audit.user.avatar ?
                    `https://cdn.discordapp.com/avatars/${audit.user.id}/${audit.user.avatar}` :
                    `https://cdn.discordapp.com/embed/avatars/${audit.user.discriminator % 4}.png`;
            }

            /* Name */
            if(guild.name !== oldGuild.name) fields.push({
                name: `Name`,
                value: [
                    `**Before:** ${oldGuild.name}`,
                    `**After:** ${guild.name}`
                ].join("\n"),
                inline: true
            });

            /* Verification Level */
            const levels = [
                "None",
                "Low",
                "Medium",
                "(╯°□°）╯︵ ┻━┻",
                "┻━┻彡 ヽ(ಠ益ಠ)ノ彡┻━┻"
            ];
            if(guild.verificationLevel !== oldGuild.verificationLevel) fields.push({
                name: `Verification Level`,
                value: [
                    `**Before:** ${levels[oldGuild.verificationLevel]} (${oldGuild.verificationLevel + 1})`,
                    `**After:** ${levels[guild.verificationLevel]} (${guild.verificationLevel + 1})`
                ].join("\n"),
                inline: true
            });

            /* Icon */
            if(guild.icon !== oldGuild.icon) fields.push({
                name: `Icon`,
                value: [
                    `**Before:** ${oldGuild.icon ?
                    `https://cdn.discordapp.com/icons/${oldGuild.id}/${oldGuild.icon}.${oldGuild.icon.includes("a_") ? ".gif" : ".png"}` :
                    `"None"`}`,
                    `**After:** ${guild.icon ?
                        `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.includes("a_") ? ".gif" : ".png"}` :
                        `"None"`}`
                ].join("\n"),
                inline: true
            });

            /* Splash */
            if(guild.splash !== oldGuild.splash) fields.push({
                name: `Splash`,
                value: [
                    `**Before:** ${oldGuild.splash ?
                    `https://cdn.discordapp.com/splashes/${oldGuild.id}/${oldGuild.splash}.${oldGuild.splash.includes("a_") ? ".gif" : ".png"}` :
                    `"None"`}`,
                    `**After:** ${guild.splash ?
                        `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.${guild.splash.includes("a_") ? ".gif" : ".png"}` :
                        `"None"`}`
                ].join("\n"),
                inline: true
            });

            /* Banner */
            if(guild.banner !== oldGuild.banner) fields.push({
                name: `Banner`,
                value: [
                    `**Before:** ${oldGuild.banner ?
                    `https://cdn.discordapp.com/banners/${oldGuild.id}/${oldGuild.banner}.${oldGuild.banner.includes("a_") ? ".gif" : ".png"}` :
                    `"None"`}`,
                    `**After:** ${guild.banner ?
                        `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.includes("a_") ? ".gif" : ".png"}` :
                        `"None"`}`
                ].join("\n"),
                inline: true
            });

            /* Region */
            if(guild.region !== oldGuild.region) fields.push({
                name: `Region`,
                value: [
                    `**Before:** ${oldGuild.region.toCamelCase()}`,
                    `**After:** ${guild.region.toCamelCase()}`
                ].join("\n"),
                inline: true
            });

            /* AFK Channel */
            if((guild.afkChannelID || oldGuild.afkChannelID) && guild.afkChannelID !== oldGuild.afkChannelID) {
                const oldChannel = guild.channels.get(oldGuild.afkChannelID);
                const newChannel = guild.channels.get(guild.afkChannelID);
                fields.push({
                name: `AFK Channel`,
                value: [
                    `**Before:** ${oldChannel ? oldChannel.name : oldGuild.afkChannelID}`,
                    `**After:** ${newChannel ? newChannel.name : newChannel.afkChannelID}`
                ].join("\n"),
                inline: true
                });
            }

            /* AFK Timeout */
            if(guild.afkTimeout !== oldGuild.afkTimeout) fields.push({
                name: `AFK Timeout`,
                value: [
                    `**Before:** ${oldGuild.afkTimeout ? `${(oldGuild.afkTimeout/60).toFixed(0)} Minutes` : "None"}`,
                    `**After:** ${guild.afkTimeout ? `${(guild.afkTimeout/60).toFixed(0)} Minutes` : "None"}`
                ].join("\n"),
                inline: true
            });

            /* Owner */
            if(guild.ownerID !== oldGuild.ownerID) {
                const oldMember = guild.members.get(oldGuild.ownerID);
                const newMember = guild.members.get(guild.ownerID);
                fields.push({
                name: `Owner`,
                value: [
                    `**Before:** ${oldMember ? `${oldMember.username}#${oldMember.discriminator}` : oldGuild.ownerID}`,
                    `**After:** ${newMember ? `${newMember.username}#${newMember.discriminator}` : newChannel.ownerID}`
                ].join("\n"),
                inline: true
                });
            }

            /* Features */
            if(!_.isEqual(oldGuild.features, guild.features)) {
                /* Added */
                const addedFeatures = guild.features.filter(feature => !oldGuild.features.includes(feature));
                if(addedFeatures.length) fields.push({
                    name: `Added Features`,
                    value: `${addedFeatures.map(feature => `\`${feature.split("_").join(" ").toCamelCase()}\``).join(", ")}`
                });

                /* Removed */
                const removedFeatures = oldGuild.features.filter(feature => !guild.features.includes(feature));
                if(removedFeatures.length) fields.push({
                    name: `Removed Features`,
                    value: `${removedFeatures.map(feature => `\`${feature.split("_").join(" ").toCamelCase()}\``).join(", ")}`
                });
            }

            const payload = {
                embeds: [
                    {
                        title: `Guild Updated - ${guild.name}`,
                        author,
                        fields,
                        color: this.client.utils.colors.yellow,
                        timestamp: new Date,
                        footer: {
                            text: `ID: ${guild.id}`
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