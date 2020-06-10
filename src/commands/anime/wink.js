/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");
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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const eEmbed = this.client.embeds.error(null, {
                description: translator.translate("COULDNT_FETCH_IMAGE")
            });
            const { data } = await axios.get(`https://some-random-api.ml/animu/wink`).catch(e => {
                return responder.send({ embed: eEmbed });
            });
            if(!data || !data.link) return responder.send({ embed: eEmbed });
            const embed = this.client.embeds.embed();
            embed.description = translator.translate("WINK_MSG", message.author.mention);
            embed.image = {
                url: data.link
            };
            embed.color = this.client.utils.colors.pink;
            responder.send({ embed });
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