/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "clearwarns",
            description: "Clearwarns of a Member in a Guild.",
            usage: "<user>",
            guildOnly: true,
            aliases: ["clearwarn"],
            permission: {
                bot: ["embedLinks"],
                user: ["manageMessages"]
            },
            args: [
                { name: `user`, type: String, defaultOption: true },
                { name: `reason`, alias: `r`, type: String, multiple: true, defaultValue: [ `No reason was provided` ] }
            ],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            /* Check args */
            if(!args.user) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "User **Mention** (or) **ID**");
                return responder.send({ embed });
            }
            const argsWarn = args.user;
            const toBeWarned = await this.client.parseMention(argsWarn) || false;
            const member = message.channel.guild.members.get(toBeWarned) || false;
            if(!toBeWarned || !member) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_SMTH_FOUND_WITH", "User", argsWarn);
                return responder.send({ embed });
            }

            const reason = args.reason.join(" ");

            /* Lets Clear the Warns */
            const key = {
                userID: member.user.id,
                guildID: message.channel.guild.id
            };
            let MemberDB = await this.client.database.Member.findOne({ where: key });
            if(!MemberDB) {
                MemberDB = await this.client.database.Member.create(key);
            };
            const warnLength = MemberDB.dataValues.warnings ? MemberDB.dataValues.warnings.length : 0;
            const warnings = [];
            const warnCase = {
                affected: `${member.user.id}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Clearwarns`
            };
            if(warnLength > 0) await CaseHandler(this.client, message.channel.guild, warnCase).catch(() => {});
            await this.client.database.Member.update({ warnings }, { where: key })
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = translator.translate("NO_SMTH_FOUND_FOR", "warnings", `${member.user.username}#${member.user.discriminator}`);
                if(warnLength > 0) embed.description = `${this.client.emojis.tick} Cleared **${warnLength}** of **${member.user.username}#${member.user.discriminator}**!`;
                return responder.send({ embed });
            })
            .catch(err => {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("SOMETHING_WRONG", err);
                return responder.send({ embed });
            });
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