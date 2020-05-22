/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "reload",
            description: "Reloads the Command.",
            usage: "<command>",
            guildOnly: false,
            aliases: ["rel"],
            permission: {
                bot: [],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args) {
        if(!this.client.config.owner.includes(message.author.id)) return;
        if(!args[0]) return message.channel.createMessage(`${this.client.emojis.cross} No Command was Provided!`);
        if(this.client.commands.has(args[0]) || this.client.aliases.has(args[0])) {
            this.reload(this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0])))
            .then(() => message.channel.createMessage(`${this.client.emojis.tick} Reloaded \`${args[0]}\``))
            .catch((e) => message.channel.createMessage(`${this.client.emojis.cross} Error\n\`\`\`${e}\`\`\``));
        }
    }

    reload(command) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(command.conf.dir)];
                const cmd = new (require(command.conf.dir))(this.client);
                this.client.commands.delete(command);
                this.client.aliases.forEach((cmd, alias) => {
                    if(command.conf.aliases.includes(alias)) this.client.aliases.delete(alias);
                });
                cmd.conf.dir = command.conf.dir;
                cmd.conf.category = command.conf.category.toProperCase();
                this.client.commands.set(cmd.conf.name, cmd);
                cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.conf.name));
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = _Command;