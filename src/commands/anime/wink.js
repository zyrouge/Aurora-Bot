/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));
const axios = require("axios");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "wink",
            description: "Wink 😉",
            usage: "",
            guildOnly: false,
            aliases: [],
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
            const eEmbed = this.client.embeds.error(null, {
                description: 'Couldn\'t fetch an Image.'
            });
            const { data } = await axios.get(`https://some-random-api.ml/animu/wink`).catch(e => {
                return responder.send({ embed: eEmbed });
            });
            if(!data || !data.link) return responder.send({ embed: eEmbed });
            const embed = this.client.embeds.embed();
            embed.description = `${message.author.mention} winks!`;
            embed.image = {
                url: data.link
            };
            embed.color = this.client.utils.colors.pink;
            responder.send({ embed });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;