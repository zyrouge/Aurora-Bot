/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "purge",
            description: "Purges messages in a Channel.",
            usage: "<count>",
            guildOnly: true,
            aliases: ["pu", "clear"],
            permission: {
                bot: ["manageMessages", "embedLinks"],
                user: ["manageMessages"]
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            if(!args.length) return responder.send({ embed: this.helpMsg() });
            const userID = await this.client.parseMention(args[0]);
            if(userID && message.channel.guild.members.get(userID)) return this.commands.get("<user>").run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs });
            if(isNaN(args[0])) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Invalid Number");
                return responder.send({ embed });
            }
            const amount = parseInt(args[0]);
            if(amount > 1000) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Number");
                return responder.send({ embed });
            }
            message.channel.purge(amount + 1, undefined, undefined, undefined, `Purged by ${message.author.tag}`)
            .then(async cnt => {
                const embed = this.client.embeds.success();
                embed.description = `${this.client.emojis.tick} Purged **${cnt - 1}** messages.`;
                const msg = await responder.send({ embed });
                setTimeout(() => { msg.delete(); }, 5000);
            })
            .catch(e => {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} Couldn\'t purge. **${e}**`;
                return responder.send({ embed });
            })
            return true;
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