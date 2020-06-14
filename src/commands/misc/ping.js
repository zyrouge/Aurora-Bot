/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "ping",
            description: "Shows my ping.",
            usage: "",
            guildOnly: false,
            aliases: ["pong"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            responder.send(`Pinging...`)
            .then(m => m.edit(`Pong! \`${Math.floor(Date.now() - m.timestamp)}ms\``));
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