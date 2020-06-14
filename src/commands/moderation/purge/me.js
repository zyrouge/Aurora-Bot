/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "me",
            description: "Purges messages of a User in a Channel.",
            usage: "<count>",
            aliases: [],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            if(!args.length) return responder.send({ embed: this.helpMsg() });
            if(!args[0]) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Purge Amount");
                return responder.send({ embed });
            }
            if(isNaN(args[0])) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "Invalid Number");
                return responder.send({ embed });
            }
            const amount = parseInt(args[0]) + 1;
            message.channel.purge(amount, (msg) => msg.author.id == message.author.id, undefined, undefined, `Purged by ${message.author.tag}`)
            .then(async cnt => {
                const embed = this.client.embeds.success();
                embed.description = `${this.client.emojis.tick} Purged **${cnt - 1}** messages of **${message.author.username}#${message.author.discriminator}**.`;
                const msg = await responder.send({ embed });
                setTimeout(() => { msg.delete().catch(() => {}); }, 5000);
            })
            .catch(e => {
                if (e.code !== 10008) {
                    const embed = this.client.embeds.error();
                    embed.description = `${this.client.emojis.cross} Failed to purge messages. (10008)`;
                    return responder.send({ embed });
                } else {
                    const embed = this.client.embeds.error();
                    embed.description = `${this.client.emojis.cross} Couldn\'t purge. **${e}**`;
                    return responder.send({ embed });
                }
            })
            return true;
        } catch (e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;