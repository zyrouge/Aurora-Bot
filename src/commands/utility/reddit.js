/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "reddit",
            description: "Fetches a random post from the Subreddit.",
            usage: "<subreddit>",
            guildOnly: false,
            aliases: ["subreddit", "r"],
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
            if(!args.length) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} No Subreddit name was provided!`
                })
            });
    
            const res = await this.client.utils.fetchers.reddit(args.join("_"), { nsfw: message.channel.nsfw || false });
            if(!res || !res.name) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} No results for \`${args.join("_")}\``
                })
            });

            const embed = {
                title: res.name.substr(0, 300),
                fields: [],
                timestamp: new Date,
                color: this.client.utils.colors()
            };

            if(res.url) embed.url = res.url;
            if(res.text) embed.description = res.text.substr(0, 300);
            if(res.image) embed.image = { url: res.image };
            else if(res.thumbnail) embed.image = { url: res.thumbnail };
            
            embed.footer = {
                icon_url: `https://www.redditinc.com/assets/images/site/reddit-logo.png`,
                text: `${res.subreddit.subreddit || args.join("_")} • 👍 ${res.likes || 0} • 👎 ${res.dislikes || 0}`
            };

            message.channel.createMessage({ embed });
        } catch (e) {
            if(e.toString().includes(404)) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} No results for \`${args.join("_")}\``
                })
            });
    
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;