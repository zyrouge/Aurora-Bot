/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "warns",
            description: "Clearwarns of a Member in a Guild.",
            usage: "<user>",
            guildOnly: true,
            aliases: ["warnings", "warning"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            /* Check args */
            const user = message.mentions.length > 0 ? message.mentions[0] : message.author;

            /* Lets Send the Warns */
            const key = {
                userID: user.id,
                guildID: message.channel.guild.id
            };
            let MemberDB = await this.client.database.Member.findOne({ where: key });
            if(!MemberDB) {
                MemberDB = await this.client.database.Member.create(key);
            };
            const warnLength = MemberDB.dataValues.warnings ? MemberDB.dataValues.warnings.length : 0;
            const embed = this.client.embeds.embed();
            embed.description = `${this.client.emojis.tick} No warnings were found for **${user.username}#${user.discriminator}**!`
            if(warnLength > 0) embed.description = `${this.client.emojis.tick} **${user.username}#${user.discriminator}** has **${warnLength}** warnings!`;
            return responder.send({ embed });
        } catch (e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;