/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "kick",
            description: "Kick a Member from Guild.",
            usage: "<user> -r [reason]",
            guildOnly: true,
            aliases: ["ki"],
            permission: {
                bot: ["kickMembers", "embedLinks"],
                user: ["kickMembers"]
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
            const argsKick = args.user;
            const toBeKicked = await this.client.parseMention(argsKick) || false;
            const member = message.channel.guild.members.get(toBeKicked) || false;
            if(!toBeKicked || !member) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_SMTH_FOUND_WITH", "User", argsKick);
                return responder.send({ embed });
            }

            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Administrator!`;
                return responder.send({ embed });
            }

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Moderator!`;
                return responder.send({ embed });
            }

            /* Check if could be Kicked */
            if(!member.kickable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permission to kick **${member.user.username}#${member.user.discriminator}**!`;
                return responder.send({ embed });
            }
            const reason = args.reason.join(" ");

            /* Create a Case */
            await CaseHandler(this.client, message.channel.guild, {
                affected: `${member.user.id}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Kick`
            }).catch(() => {});

            /* Lets Kick */
            this.client.kickGuildMember(message.channel.guild.id, toBeKicked, reason)
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = translator.translate("SUCCESS_SMTH_TASK", `**${member.user.username}#${member.user.discriminator}**`, "kicked");
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