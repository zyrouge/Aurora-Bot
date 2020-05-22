/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "invite",
            description: "Aurora Invite Link.",
            usage: "",
            guildOnly: false,
            aliases: ["botinfo"],
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
            responder.send({
                embed: {
                    title: `Click Here to add me to your Server!`,
                    url: `${this.client.config.invite}`,
                    color: this.client.utils.colors.fuschia
                }
            });
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