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
            name: "level",
            description: "Shows your Level in the Server.",
            usage: "<text>",
            guildOnly: true,
            aliases: ["rank"],
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
            let user = message.author;
            if(args[0]) {
                const parsed = await this.client.parseMention(args[0]) || false;
                const member = message.channel.guild.members.get(parsed) || false;
                user = member ? member.user : user;
            }

            const key = {
                guildID: message.channel.guild.id
            };
          
            const allMemberRanks = await this.client.database.Member.findAll({
                where: key,
                order: [
                    ['expPoints', 'DESC']
                ],
                attributes: ['userID', 'expPoints', 'expLevel']
            });

            const MemberDB = allMemberRanks.find(x => x.dataValues.userID == user.id);
            
            if(!MemberDB || !MemberDB.dataValues || !MemberDB.dataValues.expLevel || MemberDB.dataValues.expLevel == 0) return responder.send({
                embed: this.client.embeds.error(user, {
                    description: `${this.client.emojis.cross} ${message.author.id == user.id ? "You" : "They"} haven\'t Ranked yet!`
                })
            });

            const Rank = allMemberRanks.filter(x => x.dataValues && x.dataValues.expPoints).map(x => x.dataValues.userID).indexOf(user.id) + 1;

            /* Canvas */
            registerFont(path.resolve(`Poppins-SemiBoldItalic.ttf`), { family: 'Poppins Semi Bold' });
            registerFont(path.resolve(`Poppins-Italic.ttf`), { family: 'Poppins Italic' });
            const canvas = createCanvas(500, 120);
            const ctx = canvas.getContext("2d");

            /* Draw Background */
            const cardImage = await loadImage('https://github.com/zyrouge/aurora-cdn/blob/master/rankcard.png?raw=true');
            ctx.drawImage(cardImage, 0, 0, 500, 120);
          
            /* Save */
            ctx.save();

            /* Draw PFP */
            const userPFP = await loadImage(`${user.avatarURL}`);
            const RADIUS = 53;
            ctx.beginPath();
            ctx.arc(9 + RADIUS, 7 + RADIUS, RADIUS, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(userPFP, 9, 7, RADIUS * 2, RADIUS * 2);
            ctx.closePath();
          
            /* Restore */
            ctx.restore();
          
            /* Write Username */
            ctx.font = "bold 28px 'Poppins Semi Bold'";
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText(`${user.username}`, 318 - (ctx.measureText(`#${user.discriminator}`).width / 2), 20);
          
            /* Write Discrim */
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText(`#${user.discriminator}`, 318 + (ctx.measureText(`${user.username}`).width / 2), 20);
          
            /* Abacus */
            let GuildDB = await this.client.database.Guild.findOne({ where: key });
            if(!GuildDB) GuildDB = await this.client.database.Guild.create(key);
            const Level = MemberDB.dataValues.expLevel;
            const Points = MemberDB.dataValues.expPoints;
            const neededPoints = Math.pow(((parseInt(Level) + 1) / (parseInt(GuildDB.dataValues.expThreshold) / 10)), 2);
            const previousRankPoints = Math.pow((parseInt(Level) / (parseInt(GuildDB.dataValues.expThreshold) / 10)), 2);
            const START = 169;
            const TOP = 88;
            const BARHEIGHT = 16;
            const FULLBARWIDTH = 309;
            const _BARWIDTH = this.calculator(Points, previousRankPoints, neededPoints, 0, FULLBARWIDTH);
            const BARWIDTH = _BARWIDTH > FULLBARWIDTH - 14 ? FULLBARWIDTH - 14 : _BARWIDTH;
          
            /* Bar */
            ctx.beginPath();
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.arc(START + (BARHEIGHT / 2), TOP + (BARHEIGHT / 2), BARHEIGHT / 2, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.fill();
            ctx.fillRect(START + (BARHEIGHT / 2), TOP, BARWIDTH, BARHEIGHT);
            ctx.arc(START + (BARHEIGHT / 2) + BARWIDTH, TOP + (BARHEIGHT / 2), BARHEIGHT / 2, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.fill();
          
            /* Seetings for further progress */
            ctx.font = "bold 20px 'Poppins Italic'";
            ctx.textBaseline = "top";
            const ADJUSTER = 35;
          
            /* Level */
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.textAlign = "left";
            ctx.fillText(`LEVEL:`, 173 + ADJUSTER, 55);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(`${Level}`, 173 + ctx.measureText(`LEVEL:`).width + ADJUSTER, 55);
          
            /* Rank */
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.textAlign = "right";
            ctx.fillText(`RANK:`, 469 - ctx.measureText(`#${millify.default(Rank)}`).width - ADJUSTER, 55);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(`#${millify.default(Rank)}`, 469 - ADJUSTER, 55);
          
            /* Current Points */
            ctx.font = "bold 13px 'Poppins Semi Bold'";
            ctx.fillStyle = "#8E32D3";
            ctx.textAlign = "left";
            let startPositionCurrent = 179;
            if(BARWIDTH < ctx.measureText(`${millify.default(Points)}`).width) {
                startPositionCurrent = startPositionCurrent + BARWIDTH + 14;
                ctx.fillStyle = "#FFFFFF";
            }
            ctx.fillText(`${millify.default(Points)}`, startPositionCurrent, 86);
          
            /* Needed Points */
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "right";
            let startPositionNeeded = 469;
            if(BARWIDTH + 170 + ctx.measureText(`${millify.default(neededPoints)}`).width + 14 > startPositionNeeded) {
                startPositionNeeded = BARWIDTH + 170;
                ctx.fillStyle = "#8E32D3";
            }
            ctx.fillText(`${millify.default(neededPoints)}`, startPositionNeeded, 86);
            
            /* Send Card */
            message.channel.createMessage(undefined, {
                file: canvas.toBuffer(),
                name: `rank_${message.guild.id}_${user.id}.png`
            });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
  
    calculator(num, in_min, in_max, out_min, out_max) {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}

module.exports = _Command;