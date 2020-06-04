/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));
const CaseHandler = require(path.resolve(`src`, `core`, `Creators`, `Case`));

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

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            /* Check args */
            if(!args.user) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No User **Mention** (or) **ID** was found!`;
                return responder.send({ embed: embed });
            }
            const argsWarn = args.user;
            const toBeWarned = await this.client.parseMention(argsWarn) || false;
            const member = message.channel.guild.members.get(toBeWarned) || false;
            if(!toBeWarned || !member) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No User was found with \`${argsWarn}\``;
                return responder.send({ embed: embed });
            }

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Moderator!`;
                return responder.send({ embed: embed });
            }

            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.username}#${member.user.discriminator}** is a Administrator!`;
                return responder.send({ embed: embed });
            }

            /* Check if could be Punished */
            if(!member.punishable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permissions to warn **${member.user.tag}**!`;
                return responder.send({ embed: embed });
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
                embed.description = `${this.client.emojis.tick} **${member.user.tag}** was warned!`;
                return responder.send({ embed: embed });
            })
            .catch((e) => {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} Something went wrong! (${e})`;
                return responder.send({ embed: embed });
            });
        } catch (e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;