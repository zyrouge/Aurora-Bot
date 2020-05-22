/** 
 * @author ZYROUGE
 * @license MIT
*/

const { Collection } = require("eris");
const fs = require("fs");
const path = require("path");

class Command {
    constructor (client, {
        name = null,
        description = "No description provided.",
        category = "Misc",
        usage = "No usage provided.",
        enabled = true,
        guildOnly = false,
        aliases = new Array(),
        permission = {
            bot: new Array(),
            user: new Array()
        },
        args = new Array(),
        cooldown = 6,
        hasSub = false,
        isSub = false,
        dir = null,
        _dir = null
    }) {
        this.client = client;
        this.conf = {
            name,
            description,
            category,
            usage,
            enabled,
            guildOnly,
            aliases,
            args,
            cooldown,
            hasSub,
            isSub,
            permission,
            dir,
            _dir
        };
        this.commands = new Collection();
        this.aliases = new Collection();
    }
    
    hasCmd(cmd) {
        return !!(this.commands.has(cmd) || this.aliases.has(cmd));
    }

    async setup() {
        if(!this.conf.hasSub) throw new Error(`This is not a sub-command`);
        if(!this.conf._dir) throw new Error(`No Parent Dir was found`);
        fs.readdir(this.conf._dir, (error, subFiles) => {
            if(error) return error;
            const filteredSubs = subFiles.filter(file => file !== "index.js");
            filteredSubs.forEach(subFile => {
                const subDir = path.join(`${this.conf._dir}`, `${subFile}`);
                const subCmd = new (require(subDir))(this.client);
                subCmd.conf.dir = subDir;
                subCmd.conf.isSub = true;
                subCmd.conf.category = this.conf.category.toProperCase();
                subCmd.conf.createdAt = fs.lstatSync(subDir).birthtime;
                this.commands.set(subCmd.conf.name, subCmd);
                subCmd.conf.aliases.forEach(alias => this.aliases.set(alias, subCmd.conf.name));
            });
        });
    }

    helpMsg() {
        const invokers = [this.conf.name, ...this.conf.aliases];
        const subCommands = this.commands
            .map(x => `${this.client.config.prefix}${this.conf.name} ${x.conf.name} ${x.conf.usage}`);
        return {
            title: `Command: ${this.conf.name.toCamelCase()}`,
            description: `
**Invoker${invokers.length !== 0 ? "s" : ""}:** ${invokers.map(x => `\`${x}\``).join(", ")}
**Description:** ${this.conf.description}
**User Permissions:** ${this.conf.permission.user.map(p => `\`${p}\``).join(", ") || "None"}
**Bot Permissions:** ${this.conf.permission.bot.map(p => `\`${p}\``).join(", ") || "None"}
**Compatibility:** ${this.conf.guildOnly ? 'Guild Only' : 'Guild & DM'}
**Cooldown:** ${this.conf.cooldown} Seconds`,
            fields: [
                {
                    name: `Usage`,
                    value: [
                        `\`\`\`js`,
                        `${this.client.config.prefix}${this.conf.name} ${this.conf.usage}`,
                        `${!subCommands.length
                            ? `@Aurora ${this.conf.name} ${this.conf.usage}`
                            : `${subCommands.join("\n")}`}`,
                        `\`\`\``
                    ].join("\n"),
                    inline: false
                }
            ],
            color: this.client.utils.colors.fuschia,
            timestamp: new Date(),
            footer: {
                text: `${this.client.user.username}`,
                icon_url: `${this.client.user.avatarURL}`
            }
        }
    }
};

module.exports = Command;