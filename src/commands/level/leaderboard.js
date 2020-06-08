/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");
const { createCanvas, loadImage, registerFont } = require("canvas");
const millify = require('millify');

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "leaderboard",
            description: "Shows Server Leaderboard.",
            usage: "[page]",
            guildOnly: true,
            aliases: ["lb", "rankboard", "rb", "levels", "ranks"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            cooldown: 30,
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            const limit = 10;
            let page = 1;
            if(args[0] && !isNaN(args[0])) {
                page = parseInt(args[0]);
            }
            const offset = (page - 1) * limit;
          
            const MemberRanks = await this.client.database.Member.findAll({
                where: {
                    guildID: message.channel.guild.id
                },
                order: [
                    ['expPoints', 'DESC']
                ],
                attributes: [ 'userID', 'expPoints', 'expLevel' ],
                offset,
                limit,
                subQuery: false
            });
          
            let embed = {
                author: {
                    name: `${message.guild.name} Leaderboard`,
                    icon_url: message.guild.iconURL
                },
                description: `${MemberRanks.length ? "" : "No Results were Found."}`,
                timestamp: new Date(),
                color: this.client.utils.colors.fuschia,
                footer: {
                    text: `Page ${page} • ${this.client.user.username}`,
                    icon_url: `${this.client.user.avatarURL}`
                }
            };
            
            for(let i = 0; i < MemberRanks.length; i++) {
                const rank = MemberRanks[i];
                if(rank || rank.dataValues || rank.dataValues.expPoints || rank.dataValues.expLevel) {
                    const member = message.guild.members.get(rank.userID);
                    let pos = i + offset + 1;
                    if(pos == 1) pos = '🥇';
                    else if(pos == 2) pos = '🥈';
                    else if(pos == 3) pos = '🥉';
                    else pos = `**${pos}**`;
                    if(member) embed.description += `${pos} **${member.user.username}**#${member.user.discriminator} [Exp: **${rank.dataValues.expPoints}** | Level: **${rank.dataValues.expLevel}**]\n`
                }
            }
          
            message.channel.createMessage({ embed });
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