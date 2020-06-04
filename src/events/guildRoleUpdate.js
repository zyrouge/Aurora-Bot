/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require("path");
const WebhookSender = require(path.resolve("src", "core", "Webhook"));
const { diff } = require('deep-diff');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild, role, oldRole) {
        if(!guild || !role) return;
        const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: guild.id } });
        this.Logger(GuildDB, guild, role, oldRole).catch(() => {});
    }

    async Logger(GuildDB, guild, role, oldRole) {
        if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.serverLogs) {
            const LogChannel = guild.channels.get(`${GuildDB.dataValues.serverLogs}`);
            if(!LogChannel) return;

            const webhookURL = await this.getHook(LogChannel, GuildDB).catch(() => {});
            if(!webhookURL) return;

            const author = {};
            const fields = new Array();
            
            /* Audit Logs */
            const auditLogs = await guild.getAuditLogs(10, undefined, 32);
            const audit = auditLogs && auditLogs.entries ?
                auditLogs.entries.sort((a, b) => b.id - a.id).find(log => log.targetID == role.id) : undefined;
            if(audit && audit.user) {
                author.name = `${audit.user.username}#${audit.user.discriminator}`;
                author.icon_url = audit.user.avatar ?
                    `https://cdn.discordapp.com/avatars/${audit.user.id}/${audit.user.avatar}` :
                    `https://cdn.discordapp.com/embed/avatars/${audit.user.discriminator % 4}.png`;
            }

            /* Permissions */
            const permDiffs = diff(oldRole.permissions.json, role.permissions.json);
            const yeser = (yes) => yes ? "Yes" : "No";
            if(permDiffs && permDiffs.length) {
                /* Added */
                const addedPerms = permDiffs.filter(perm => perm.kind == "N");
                if(addedPerms.length) fields.push({
                    name: `Added Permissions`,
                    value: `${addedPerms.map(perm => `\`${perm.path}\``).join(", ")}`
                });

                /* Updated */
                const updatedPerms = permDiffs.filter(perm => perm.kind == "E");
                if(updatedPerms.length) fields.push({
                    name: `Changed Permissions`,
                    value: `${updatedPerms.map(perm => `\`${perm.path} [${yeser(perm.lhs)} -> ${yeser(perm.rhs)}]\``).join(", ")}`
                });

                /* Removed */
                const removedPerms = permDiffs.filter(perm => perm.kind == "D");
                if(removedPerms.length) fields.push({
                    name: `Removed Permissions`,
                    value: `${removedPerms.map(perm => `\`${perm.path}\``).join(", ")}`
                });
            }

            /* Position */
            if(role.position !== oldRole.position) fields.push({
                name: `Position`,
                value: [
                    `**Before:** ${guild.roles.size + oldRole.position}`,
                    `**After:** ${guild.roles.size + role.position}`
                ].join("\n")
            });

            /* Mentionable */
            if(role.mentionable !== oldRole.mentionable) fields.push({
                name: `Mentionable`,
                value: [
                    `**Before:** ${oldRole.mentionable ? "Yes" : "No"}`,
                    `**After:** ${role.mentionable ? "Yes" : "No"}`
                ].join("\n")
            });

            /* Hoist */
            if(role.hoist !== oldRole.hoist) fields.push({
                name: `Hoist`,
                value: [
                    `**Before:** ${oldRole.hoist ? "Yes" : "No"}`,
                    `**After:** ${role.hoist ? "Yes" : "No"}`
                ].join("\n")
            });

            const payload = {
                embeds: [
                    {
                        title: `Role Updated - ${role.name}`,
                        author,
                        fields,
                        color: this.client.utils.colors.yellow,
                        timestamp: new Date,
                        footer: {
                            text: `ID: ${role.id}`
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