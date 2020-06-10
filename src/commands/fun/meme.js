/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "meme",
            description: "Random memes from subreddit.",
            usage: "",
            guildOnly: false,
            aliases: ["meme", "dankmeme", "dankmemes"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, ...others) {
        try {
            const memeReddits = [
                "MemeEconomy",
                "ComedyCemetery",
                "memes",
                "dankmemes",
                "PrequelMemes",
                "terriblefacebookmemes",
                "funny",
                "teenagers"
            ];
            return this.client.commands.get("reddit").run(message, [ memeReddits.random() ], ...others);
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