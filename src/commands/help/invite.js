/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
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
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;