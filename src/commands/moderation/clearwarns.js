/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));
const CaseHandler = require(path.resolve(`src`, `core`, `Creators`, `Case`));

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
                embed.description = `${this.client.emojis.tick} No warnings were found for **${member.user.tag}**!`
                if(warnLength > 0) embed.description = `${this.client.emojis.tick} Cleared **${warnLength}** of **${member.user.tag}**!`;
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