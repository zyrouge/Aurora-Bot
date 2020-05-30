/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "slots",
            description: "Try your like in Slot Machines.",
            usage: "[1-1000]",
            guildOnly: false,
            aliases: ["slot", "slotmachine"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            cooldown: 60,
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            if(!args[0]) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Specify the **Amount** to be Slotted!`
                })
            });
            if(isNaN(args[0])) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Amount must be in **Number**!`
                })
            });
            const slotAmt = parseInt(args[0]);
            if(slotAmt < 0 || slotAmt > 1000) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Slot Amount must be between **1 and 1000**!`
                })
            });
            let userDB = await this.client.database.User.findOne({
                attributes: [ 'pocketCash' ],
                where: {
                    userID: `${message.author.id}`
                }
            });
            if(!userDB) userDB = await this.client.database.User.create({
                userID: `${message.author.id}`,
                pocketCash: '0'
            });
            let balance = parseInt(userDB.dataValues.pocketCash);
            if(balance < slotAmt) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} You don\'t have enough **Currencies**!`
                })
            });
            const slots = ["🍇", "🍒", "💎", "🔔", "🍉", "🍋"];
            const embed = {
                author: {
                    name: `🎰 Slot Machine`,
                    icon_url: `${message.author.avatarURL}`
                },
                description: `**[** ${slots.random()} **|** ${slots.random()} **|** ${slots.random()} **]**`,
                timestamp: new Date(),
                footer: {
                    text: `${this.client.user.username}`,
                    icon_url: `${this.client.user.avatarURL}`
                }
            };
            const msg = await responder.send({ embed }, null, false);
            setTimeout(() => {
                embed.description = `**[** ${slots.random()} **|** ${slots.random()} **|** ${slots.random()} **]**`
                msg.edit({ embed });
                setTimeout(() => {
                    embed.description = `**[** ${slots.random()} **|** ${slots.random()} **|** ${slots.random()} **]**`
                    msg.edit({ embed });
                    setTimeout(async () => {
                        let s1 = slots.random(), s2 = slots.random(), s3 = slots.random();
                        embed.description = `**[** ${s1} **|** ${s2} **|** ${s3} **]**`;
                        let result;
                        if(s1 == s2 && s2 == s3 && s1 == s3) {
                            balance += slotAmt;
                            result = `You Won!`;
                        } else {
                            balance -= slotAmt;
                            result = `You Lost!`;
                        }
                        await this.client.database.User.update({
                            pocketCash: `${balance}`
                        }, {
                            where: {
                                userID: `${message.author.id}`
                            }
                        });
                        embed.description += ` - **${result}**`;
                        msg.edit({ embed });
                    }, 1000);
                }, 1000);
            }, 1000);
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