/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "warn",
            description: "Warn a Member in a Guild.",
            usage: "<user> -r [reason]",
            guildOnly: true,
            aliases: ["wn"],
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

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Moderator!`;
                return responder.send({ embed });
            }

            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Administrator!`;
                return responder.send({ embed });
            }

            /* Check if could be Punished */
            if(!member.punishable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permissions to warn **${member.user.username}#${member.user.discriminator}**!`;
                return responder.send({ embed });
            }
            const reason = args.reason.join(" ");
            /* Lets Warn */
            const key = {
                userID: member.user.id,
                guildID: message.channel.guild.id
            };
            let MemberDB = await this.client.database.Member.findOne({ where: key });
            if(!MemberDB) {
                MemberDB = await this.client.database.Member.create(key);
            };
            const warnings = MemberDB.dataValues.warnings || [];
            const warnCase = {
                affected: `${member.user.id}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Warn`
            };
            const createdCase = await CaseHandler(this.client, message.channel.guild, warnCase);
            warnings.push({
                caseID: createdCase && createdCase.caseID ? `${createdCase.caseID}` : null
            });
            await this.client.database.Member.update({ warnings }, { where: key })
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = translator.translate("SUCCESS_SMTH_TASK", `**${member.user.username}#${member.user.discriminator}**`, "warned");
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