/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

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

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            if(!args.length) return responder.send({ embed: this.helpMsg() });
            if(!args[0]) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No **Purge Amount** was provided.`;
                return responder.send({ embed });
            }
            if(isNaN(args[0])) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **Invalid Number** was provided.`;
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
                    description: `Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;