/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const Eris = require("eris");
const argsParser = require('command-line-args');
const path = require("path");
const Guild = require("../database/models/Guild");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        if(message.author.bot) return;
        if (message.guild && !message.channel.guild.members.get(this.client.user.id).permission.json.sendMessages) return;

        if(message.guild) {
            const cache = this.client.cache.messages.get(message.channel.guild.id) || [];
            cache.push({
                userID: message.author.id,
                channelID: message.channel.id,
                messageID: message.id,
                content: message.content,
            });
            this.client.cache.messages.set(message.channel.guild.id, cache);
        }

        /* Database */
        let GuildDB;
        if(message.channel.guild) {
            const key = { guildID: message.channel.guild.id };
            GuildDB = await this.client.database.Guild.findOne({ where: key });
            if(!GuildDB) GuildDB = await this.client.database.Guild.create(key);
        }

        message.language = GuildDB && GuildDB.dataValues && GuildDB.dataValues.language
            ? GuildDB.dataValues.language
            : "english";
        message.prefix = GuildDB && GuildDB.dataValues && GuildDB.dataValues.prefix
            ? GuildDB.dataValues.prefix
            : this.client.config.prefix

        // const translator

        /* AFK Handler */
        const afkHandler = require(path.resolve("src", "core", "Handlers", "AFK"));
        let afkResult;
        if(message.channel.guild && !GuildDB.dataValues.disabledCommands.includes('afk')) afkResult = await afkHandler(this.client, message);

        /* Level Handler */
        const LevelHandler = require(path.resolve("src", "core", "Handlers", "Level"));
        if(message.channel.guild && !GuildDB.dataValues.disabledModules.includes('level')) LevelHandler(this.client, message, GuildDB);

        /* Prefix Handler */
        const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${this.client.utils.escapeRegex(message.prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        const [, matchedPrefix] = message.content.match(prefixRegex);

        /* Handle Args & Command */
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        let cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if(!cmd) return;

        const responder = new this.client.responder.CommandMessage(message);

        /* Check if Disabled Command */
        if(message.channel.guild && GuildDB.dataValues.disabledCommands.includes(cmd.conf.name)) {
            const embed = this.client.embeds.error(message.author);
            embed.description = `\`${cmd.conf.name}\` Command is **Disabled** in this Server.`;
            return responder.send({ embed: embed });
        }

        /* Check if Disabled Module */
        if(message.channel.guild && GuildDB.dataValues.disabledModules.includes(cmd.conf.category.toLowerCase())) {
            const embed = this.client.embeds.error(message.author);
            embed.description = `\`${cmd.conf.category}\` Module is **Disabled** in this Server.`;
            return responder.send({ embed: embed });
        }

        /* Cooldown */
        if (!this.client.cooldowns.commands.has(cmd.conf.name)) {
            this.client.cooldowns.commands.set(cmd.conf.name, new Eris.Collection());
        }
        
        const now = Date.now();
        const timestamps = this.client.cooldowns.commands.get(cmd.conf.name);
        const cooldownAmount = cmd.conf.cooldown * 1000;

        if (timestamps.has(message.author.id)) {
            const userCooldown = timestamps.get(message.author.id);
            const lastCooldownMessage = userCooldown.last;
            const expirationTime = userCooldown.time + cooldownAmount;

            if (now - lastCooldownMessage > 3000) {
                const timeLeft = (expirationTime - now) / 1000;
                responder.send(`Please wait **${timeLeft.toFixed(1)} second${timeLeft > 1 ? "s" : ""}** before reusing the \`${cmd.conf.name}\` command.`);
                const updated = {
                    time: userCooldown.time,
                    last: now
                };
                timestamps.delete(message.author.id);
                timestamps.set(message.author.id, updated);
            }

            if(now < expirationTime) return;
        }

        /* AFK Handler (Check) */
        if(afkHandler.command == cmd.conf.name && afkResult) return;

        /* Guild Requirements */
        if(cmd.conf.guildOnly && !message.channel.guild) {
            const embed = this.client.embeds.embed(message.author);
            embed.description = `\`${cmd.conf.name}\` Command can be used only in **Guilds!**`;
            return responder.send({ embed: embed });
        };

        /* NSFW Requirements */
        if(cmd.conf.nsfwOnly && !message.channel.nsfw) {
            const embed = this.client.embeds.embed(message.author);
            embed.description = `\`${cmd.conf.name}\` Command can be used only in **NSFW Channels!**`;
            return responder.send({ embed: embed });
        };

        /* Check Perms for Bot */
        if(message.channel.guild && cmd.conf.permission) {
            if(cmd.conf.permission.bot) {
                const requiredPermissions = message.channel.guild.members.get(this.client.user.id).permission;
                const missingPermissions = new Array();
                cmd.conf.permission.bot.forEach(permission => {
                    if(!requiredPermissions.has(permission)) missingPermissions.push(permission);
                });
                if(missingPermissions.length !== 0) {
                    const embed = this.client.embeds.error();
                    embed.description = `${this.client.emojis.cross} I am missing ${missingPermissions.map(perm => `\`${perm}\``).join(", ")} permission${missingPermissions.length > 1 ? "s" : ""}!`;
                    return responder.send({ embed: embed });
                }
            }

            /* Check Perms for User */
            if(message.channel.guild && cmd.conf.permission.user) {
                const requiredPermissions = message.member.permission;
                const missingPermissions = new Array();
                cmd.conf.permission.user.forEach(permission => {
                    if(!requiredPermissions.has(permission)) missingPermissions.push(permission);
                });
                if(missingPermissions.length !== 0) {
                    const embed = this.client.embeds.error();
                    embed.description = `${this.client.emojis.cross} You are missing ${missingPermissions.map(perm => `\`${perm}\``).join(", ")} permission${missingPermissions.length > 1 ? "s" : ""}!`;
                    return responder.send({ embed: embed });
                }
            }
        }

        /* Sub-Command Handling */
        if(cmd.conf.hasSub && cmd.hasCmd(args[0])) {
            const subCmd = args.shift().toLowerCase();
            const sub = cmd.commands.get(subCmd) || cmd.commands.get(cmd.aliases.get(subCmd));
            if(sub) cmd = sub;
        }

        /* Args */
        const cmdArgs = cmd.conf.args.length == 0 ? args : argsParser(cmd.conf.args, { argv: args, partial: true });

        /* Running it */
        responder.deleteSelf();
        const __cmd = cmd.run(message, cmdArgs, {
            GuildDB
        })
        .then(() => {
            timestamps.set(message.author.id, {
                time: now,
                last: (now - 4000)
            });
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        })

        if(process.env.NODE_ENV === "production") __cmd.catch(e => {
            const chalk = require("chalk");
            console.log(chalk.redBright(`[ ERROR (START) ]`));
            console.log(e);
            console.log(chalk.gray(`Event: messageCreate`));
            console.log(chalk.gray(`Logged on: ${require("../Utils/getTime")()}`));
            console.log(chalk.redBright(`[ ERROR (END) ]`));
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong! **${e}**`
                })
            });
        });
    }
}