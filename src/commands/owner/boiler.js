const { Command } = require("aurora");

/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "",
            description: "",
            usage: "",
            guildOnly: true,
            aliases: [],
            permission: {
                bot: [],
                user: []
            },
            enabled: false
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {

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