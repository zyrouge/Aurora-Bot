/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "hentai",
            description: "O///O",
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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const res = await this.client.utils.fetchers.axios("https://nekobot.xyz/api/image?type=hentai");

            if(!res || !res.data || !res.data.message) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} No Hentai was found.`
                })
            });

            const embed = {
                title: `Hentai O///O`,
                timestamp: new Date,
                color: this.client.utils.colors(),
                image: { url: res.data.message },
                footer: {
                    text: `Source: NekoBot.xyz`
                }
            };

            message.channel.createMessage({ embed });
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