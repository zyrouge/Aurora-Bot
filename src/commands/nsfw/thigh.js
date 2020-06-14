/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "thigh",
            description: "Random nsfw from subreddit.",
            usage: "",
            guildOnly: true,
            nsfwOnly: true,
            aliases: [],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, ...others) {
        try {
            const nsfwReddits = [ "thighs" ];
            return this.client.commands.get("reddit").run(message, [ nsfwReddits.random() ], ...others);
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