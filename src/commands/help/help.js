/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            description: "Shows the Help Menu.",
            usage: "[command]",
            guildOnly: false,
            aliases: ["h", "commands", "cmd"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {         
            const categories = this.client.categories.sort();
            let embed = this.client.embeds.embed();
            embed.title = `Help Menu`;
            embed.fields = new Array();
            embed.thumbnail = { url: this.client.user.avatarURL };
            if(args[0] && !isNaN(args[0]) && parseInt(args[0]) > 0 && parseInt(args[0]) - 1 < categories.length) {
                const index = parseInt(args[0]) - 1;
                const category = categories[index];
                embed.title = `Category: ${category.toProperCase()}`;
                const commands = this.client.commands.filter(x => String(x.conf.category).toLowerCase() === category.toLowerCase());
                const filteredCommands = commands.filter(x => !!(x.conf.nsfwOnly) === message.channel.nsfw);
                const hiddenCommandsLength = commands.length - filteredCommands;
                const description = `${filteredCommands.map(command => `\`${command.conf.name}\``).join(", ") || "None"}`;
                embed.description = description;
                if(this.client.utils.icons[category]) embed.thumbnail.url = this.client.utils.icons[category];
                embed.footer.text = [
                    `${this.client.config.prefix}help <command>`,
                    `${hiddenCommandsLength ? `${hiddenCommandsLength} Hidden Commands` : ""}`,
                    `${embed.footer.text}`
                ].join(" • ");
            } else if(args[0] && (this.client.commands.has(args[0]) || this.client.aliases.has(args[0]))) {
                const command = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));
                if(command.conf.nsfwOnly) embed.description = `\`${command.conf.name}\` can be viewed only in an NSFW Channel`;
                embed = command.helpMsg();
                embed.footer.text = `<> - Required • [] - Optional • ${embed.footer.text}`;
            } else {
                const randomCategory = categories.random();
                const randomNumber = categories.indexOf(randomCategory) + 1;
                const descriptionArray = [
                    `Use \`${this.client.config.prefix}help <number>\` for Commands in the **Category**`,
                    `For Example, \`${this.client.config.prefix}help ${randomNumber}\` for Commands in **${randomCategory.toProperCase()}**`,
                    `Total Commands: **${this.client.commands.size}**`
                ];
                const categoryArray = new Array();
                for (let i = 0; i < categories.length; i++) {
                    const category = categories[i];
                    categoryArray.push(`Page **${i + 1}** - ${category.toProperCase()}`);
                }
                embed.description = descriptionArray.join("\n");
                embed.fields.push({
                    name: 'Categories',
                    value: categoryArray.join("\n")
                });
                embed.footer.text = `Use a NSFW channel to view NSFW commands • ${embed.footer.text}`;
            }
            embed.fields.push({
                name: `Support`,
                value: [
                    `**Website:** [Click Here](${this.client.config.dashboard} "Website")`,
                    `**Dashboard:** [Click Here](${this.client.config.dashboard}/servers "Dashboard")`,
                    `**Discord:** [Click Here](${this.client.config.support} "Support Server")`
                ].join("\n")
            })
            message.channel.createMessage({ embed });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;