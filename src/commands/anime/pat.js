/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, Responder } = require("aurora");
const axios = require("axios");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "pat",
            description: "Pat your friends!",
            usage: "<user|name>",
            guildOnly: false,
            aliases: ["pet"],
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
            const { data } = await axios.get(`https://nekos.life/api/v2/img/pat`).catch(e => {
                return responder.send({ embed: eEmbed });
            });
            if(!data || !data.url) return responder.send({ embed: eEmbed });
            const embed = this.client.embeds.embed();
            embed.description = translator.translate("PAT_MSG", message.author.mention, (args.join(" ") || "Air"));
            embed.image = {
                url: data.url
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