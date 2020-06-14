/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "<user>",
            description: "Purges messages of a User in a Channel.",
            usage: "<count>",
            aliases: [],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            if(!args.length) return responder.send({ embed: this.helpMsg() });
            const userID = await this.client.parseMention(args[0]);
            const member = message.channel.guild.members.get(userID);
            if(!userID || !member) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Invalid User");
                return responder.send({ embed });
            }
            if(!args[1]) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Purge Amount");
                return responder.send({ embed });
            }
            if(isNaN(args[1])) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Invalid Number");
                return responder.send({ embed });
            }
            const amount = parseInt(args[1]);
            message.channel.purge(amount, (msg) => msg.author.id == userID, undefined, undefined, `Purged by ${message.author.tag}`)
            .then(async cnt => {
                const embed = this.client.embeds.success();
                embed.description = `${this.client.emojis.tick} Purged **${cnt}** messages of **${member.tag}**.`;
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
            console.error(e);
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;