/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "dashboard",
            description: "Aurora Dashboard Link.",
            usage: "",
            guildOnly: false,
            aliases: ["db", "website"],
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
                    title: `Click Here to open Dashboard`,
                    url: `${this.client.config.dashboard}`,
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