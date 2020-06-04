/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "clap",
            description: "Replace Spaces by Claps.",
            usage: "<text>",
            guildOnly: false,
            aliases: ["clapify"],
            permission: {
                bot: [],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        if(!args.length) return responder.send({
            embed: this.client.embeds.error(message.author, {
                description: `${this.client.emojis.cross} Provide Some Text to Clapify!`
            })
        });
        try {
            responder.send(args.join(" ").replace(new RegExp(" ", "g"), " 👏 ").shorten(1000));
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;