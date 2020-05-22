/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "afk",
            description: "Displays an Away from Keyboard with a Message when set.",
            usage: "[message]",
            guildOnly: true,
            aliases: ["awayfromkeyboard"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true,
            cooldown: 10
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            const key = {
                userID: `${message.author.id}`,
                guildID: `${message.channel.guild.id}`
            };
            let MemberDB = await this.client.database.Member.findOne({ where: key });
            if(!MemberDB) {
                MemberDB = await this.client.database.Member.create(key);
            }
            let afk = {
                message: `AFK`,
                setAt: Date.now(),
                pings: []
            };
            if(args.length) afk.message = args.join(" ");
            const GuildMe = message.channel.guild.members.get(this.client.user.id);
            if(GuildMe && GuildMe.permission.json.manageNicknames) message.member.edit({
                nick: `[AFK] ${message.member.nick || message.author.username}`
            }, "AFK").catch(() => {});
            responder.send({
                embed: this.client.embeds.success(message.author, {
                    description: `${this.client.emojis.tick} AFK set to: **${afk.message}**`
                })
            });
            setTimeout(async() => {
                await this.client.database.Member.update({ afk: afk }, { where: key })
                .catch(() => {
                    responder.send({
                        embed: this.client.embeds.error(message.author, {
                            description: `${this.client.emojis.cross} Couldn\'t Set your AFK.`
                        })
                    });
                });
            }, 5000);
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