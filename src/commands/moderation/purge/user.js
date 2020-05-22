/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

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

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            if(!args.length) return responder.send({ embed: this.helpMsg() });
            const userID = await this.client.parseMention(args[0]);
            const member = message.channel.guild.members.get(userID);
            if(!userID || !member) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **Invalid User** was provided.`;
                return responder.send({ embed });
            }
            if(!args[1]) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No **Purge Amount** was provided.`;
                return responder.send({ embed });
            }
            if(isNaN(args[1])) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **Invalid Number** was provided.`;
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
                    description: `Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;