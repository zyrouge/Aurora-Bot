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

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            /* Check args */
            if(!args.user) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No User **Mention** (or) **ID** was found!`;
                return responder.send({ embed: embed });
            }
            const argsKick = args.user;
            const toBeKicked = await this.client.parseMention(argsKick) || false;
            const member = message.channel.guild.members.get(toBeKicked) || false;
            if(!toBeKicked || !member) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No User was found with \`${argsKick}\``;
                return responder.send({ embed: embed });
            }

            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.tag}** is a Administrator!`;
                return responder.send({ embed: embed });
            }

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${member.user.tag}** is a Moderator!`;
                return responder.send({ embed: embed });
            }

            /* Check if could be Kicked */
            if(!member.kickable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permission to kick **${member.user.tag}**!`;
                return responder.send({ embed: embed });
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
                embed.description = `${this.client.emojis.tick} **${member.user.tag}** was kicked!`;
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