/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const categories = this.client.categories.sort();
            let embed = this.client.embeds.embed();
            embed.title = translator.translate("HELP_MENU");
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
                if(command.conf.nsfwOnly) embed.description = translator.translate("ONLY_NSFW_HELP", command.conf.name);
                embed = command.helpMsg();
                embed.footer.text = `<> - ${translator.translate("REQUIRED")} • [] - ${translator.translate("OPTIONAL")} • ${embed.footer.text}`;
            } else {
                const randomCategory = categories.random();
                const randomNumber = categories.indexOf(randomCategory) + 1;
                const categoryArray = new Array();
                for (let i = 0; i < categories.length; i++) {
                    const category = categories[i];
                    categoryArray.push(`${translator.translate("PAGE")} **${i + 1}** - ${category.toProperCase()}`);
                }
                embed.description = translator.translate("HELP_DESC", prefix, this.client.commands.size, randomNumber, randomCategory);
                embed.fields.push({
                    name: translator.translate("HELP_CATEGORIES"),
                    value: categoryArray.join("\n")
                });
                embed.footer.text = `Use a NSFW channel to view NSFW commands • ${embed.footer.text}`;
            }
            embed.fields.push({
                name: translator.translate("HELP_SUPPORT"),
                value: [
                    `**${translator.translate("WEBSITE")}:** [${translator.translate("CLICK_HERE")}](${this.client.config.dashboard} "Website")`,
                    `**${translator.translate("DASHBOARD")}:** [${translator.translate("CLICK_HERE")}](${this.client.config.dashboard}/servers "Dashboard")`,
                    `**Discord:** [${translator.translate("CLICK_HERE")}](${this.client.config.support} "Support Server")`
                ].join("\n")
            })
            message.channel.createMessage({ embed });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;