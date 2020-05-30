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
            name: "unban",
            description: "Unban a Member/User from Guild.",
            usage: "<user> -r [reason]",
            guildOnly: true,
            aliases: ["unbean"],
            permission: {
                bot: ["banMembers", "embedLinks"],
                user: ["banMembers"]
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
                embed.description = `${this.client.emojis.cross} No User **ID** was found!`;
                return responder.send({ embed: embed });
            }
            const argsBan = args.user;
            const toBeBanned = await this.client.parseMention(argsBan, true) || false;
            const user = toBeBanned && !isNaN(toBeBanned) ? (await this.client.fetchUser(toBeBanned)) : false;
            if(!toBeBanned || !user) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} No User was found with \`${argsBan}\``;
                return responder.send({ embed: embed });
            }

            /* Params */
            const reason = args.reason.join(" ");

            /* Create a Case */
            await CaseHandler(this.client, message.channel.guild, {
                affected: `${user.id}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Unban`
            }).catch(() => {});

            /* Lets Ban */
            this.client.unbanGuildMember(message.channel.guild.id, user.id, reason)
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = `${this.client.emojis.tick} **${user.username}#${user.discriminator}** was unbanned!`;
                return responder.send({ embed: embed });
            })
            .catch((e) => {
                const embed = this.client.embeds.error();
                if(e == "DiscordRESTError [10026]: Unknown Ban") {
                    embed.description = `${this.client.emojis.cross} **${user.username}#${user.discriminator}** isn\'t Banned.`;
                } else {
                    embed.description = `${this.client.emojis.cross} Couldn\'t unban them. (${e})`;
                }
                return responder.send({ embed: embed });
            });
        } catch(e) {        
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }

}

module.exports = _Command;