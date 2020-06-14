/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "mute",
            description: "Mute a Member in a Guild.",
            usage: "<user> -r [reason] -t [mins/days]",
            guildOnly: true,
            aliases: ["mu"],
            permission: {
                bot: ["manageRoles", "embedLinks"],
                user: ["manageMessages"]
            },
            args: [
                { name: `user`, type: String, defaultOption: true },
                { name: `reason`, alias: `r`, type: String, multiple: true, defaultValue: [ `No reason was provided` ] },
                { name: `time`, alias: `t`, type: String, multiple: true }
            ],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const key = { guildID: message.channel.guild.id };
            let GuildDB = await this.client.database.Guild.findOne({ where: key });

            /* Check args */
            if(!args.user) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_PARAMETER_PROVIDED", "User **Mention** (or) **ID**");
                return responder.send({ embed });
            }
            const argsMute = args.user;
            const toBeMuted = await this.client.parseMention(argsMute) || false;
            const member = message.channel.guild.members.get(toBeMuted) || false;
            if(!toBeMuted || !member) {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("NO_SMTH_FOUND_WITH", "User", argsMute);
                return responder.send({ embed });
            }

            /* Check if Mod */
            if(member && member.isModerator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${tag}** is a Moderator!`;
                return responder.send({ embed });
            }

            /* Check if Admin */
            if(member && member.isAdministrator()) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} **${tag}** is a Administrator!`;
                return responder.send({ embed });
            }

            /* Check if could be Punished */
            if(!member.punishable) {
                const embed = this.client.embeds.error();
                embed.description = `${this.client.emojis.cross} I don\'t have permissions to mute **${member.user.tag}**!`;
                return responder.send({ embed });
            }
            const reason = args.reason.join(" ");

            /* Get the Mute role */
            let muteRole = message.channel.guild.roles.find(x => x.name == "Muted");
            if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.muteRole) {
                muteRole = message.channel.guild.roles.get(`${GuildDB.dataValues.muteRole}`);
            }
            if(muteRole && (!GuildDB || !GuildDB.dataValues || !GuildDB.dataValues.muteRole)) {
                await this.client.database.Guild.update({ muteRole: muteRole.id }, { where: key });
            }
            if(!muteRole) {
                const roleOptions = {
                    name: "Muted",
                    permissions: 0,
                    hoist: false,
                    mentionable: false
                }
                muteRole = await message.channel.guild.createRole(roleOptions, "Mute Role");
                if(!GuildDB) GuildDB = await this.client.database.Guild.create(key);
                await this.client.database.Guild.update({ muteRole: muteRole.id }, { where: key });
            }

            /* Create a Case */
            await CaseHandler(this.client, message.channel.guild, {
                affected: `${member.user.id}`,
                reason,
                moderatorID: `${message.author.id}`,
                type: `Mute`
            }).catch(() => {});

            /* Lets Mute */
            member.addRole(muteRole.id, reason)
            .then(() => {
                const embed = this.client.embeds.success();
                embed.description = translator.translate("SUCCESS_SMTH_TASK", `**${member.user.username}#${member.user.discriminator}**`, "muted");
                return responder.send({ embed });
            })
            .catch(err => {
                const embed = this.client.embeds.error();
                embed.description = translator.translate("SOMETHING_WRONG", err)
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