/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "support",
            description: "Aurora Support Server Link.",
            usage: "",
            guildOnly: false,
            aliases: ["ss", "server"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            responder.send({
                embed: {
                    title: `Click Here to join Support Server`,
                    url: `${this.client.config.support}`,
                    color: this.client.utils.colors.fuschia
                }
            });
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