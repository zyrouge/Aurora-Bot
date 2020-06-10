/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        if(!args.length) return responder.send({
            embed: this.client.embeds.error(message.author, {
                description: translator.translate("NO_PARAMETER_PROVIDED", "Text")
            })
        });
        try {
            responder.send(args.join(" ").replace(new RegExp(" ", "g"), " 👏 ").shorten(1000));
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