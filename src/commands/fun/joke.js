/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "joke",
            description: "Random memes from subreddit.",
            usage: "",
            guildOnly: false,
            aliases: ["jokes"],
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
            const memeReddits = [ "jokes", "dadjokes", "cleanjokes" ];
            return this.client.commands.get("reddit").run(message, [ memeReddits.random() ]);
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;