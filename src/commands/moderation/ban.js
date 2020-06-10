/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "ban",
            description: "Ban a Member/User from Guild.",
            usage: "<user> -r [reason] -p [days]",
            guildOnly: true,
            aliases: ["bean"],
            permission: {
                bot: ["banMembers", "embedLinks"],
                user: ["banMembers"]
            },
            args: [
                { name: `user`, type: String, defaultOption: true },
                { name: `reason`, alias: `r`, type: String, multiple: true, defaultValue: [ `No reason was provided` ] },
                { name: `prune`, alias: `p`, type: Number, defaultValue: 1 }
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
            const argsBan = args.user;
            const toBeBanned = await this.client.parseMention(argsBan, true) || false;
            const user = toBeBanned && !isNaN(toBeBanned) ? (await this.client.fetchUser(toBeBanned)) : false;
            const member = message.channel.guild.members.get(toBeBanned) || false;
            if(!toBeBanned || (!member && !user)) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_SMTH_FOUND_WITH", "User", argsBan);
                return responder.send({ embed });
            }

            const tag = member ? `${member.user.username}#${member.user.discriminator}` : `${user.username}#${user.discriminator}`;
            const banID = member ? `${member.user.id}` : `${user.id}`;
            
            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${tag}** is a Administrator!`;
                return responder.send({ embed });
            }

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${tag}** is a Moderator!`;
                return responder.send({ embed });
            }

            /* Check if could be banned */
            if(member && !member.bannable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permission to ban **${tag}**!`;
                return responder.send({ embed });
            }

            /* Params */
            const reason = args.reason.join(" ");
            const days = (args.prune && args.prune >= 0 && args.prune <= 7) ? args.prune : 1;

            /* Create a Case */
            await CaseHandler(this.client, message.channel.guild, {
                affected: `${banID}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Ban (1 Day${days > 1 ? "s" : ""} Prune)`
            }).catch(() => {});

            /* Lets Ban */
            this.client.banGuildMember(message.channel.guild.id, banID, days, reason)
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = `${this.client.emojis.tick} **${tag}** was banned!`;
                return responder.send({ embed });
            })
            .catch((e) => {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} Something went wrong! (${e})`;
                return responder.send({ embed });
            });
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