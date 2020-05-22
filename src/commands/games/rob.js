/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));
var moment = require("moment");
require("moment-duration-format");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "rob",
            description: "Rob a Place with an increase in Bounty. Gain more cash, loose more cash!",
            usage: "",
            guildOnly: false,
            aliases: ["steal"],
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
            const key = { userID: message.author.id };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            const cooldown = 2 * 60 * 60 * 1000;
            if(userDB.dataValues.cooldowns[this.conf.name] && Date.now() - userDB.dataValues.cooldowns[this.conf.name] < cooldown) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Slowdown! Come back after **${moment.duration(cooldown - (Date.now() - userDB.dataValues.cooldowns[this.conf.name])).format('H[h] m[m] s[s]')}** to ${this.conf.name.toCamelCase()} again.`
                })
            });
            let balance = parseInt(userDB.dataValues.pocketCash);
            let bounty = parseInt(userDB.dataValues.bounty);
            if(balance < 1000) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} You need atleast **1000 Currencies** to Rob!`
                })
            });
            if(bounty > 1000) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} You can\'t Rob when your Bounty is above **1000**`
                })
            });
            const places = [
                {
                    name: "bank",
                    ref: "bank",
                    full: "Bank",
                    min: 5000,
                    max: 10000,
                    bounty: 600
                },
                {
                    name: "station",
                    ref: "station (Gas Station)",
                    full: "Gas Station",
                    min: 2000,
                    max: 5000,
                    bounty: 400
                },
                {
                    name: "house",
                    ref: "house",
                    full: "House",
                    min: 100,
                    max: 2000,
                    bounty: 200
                }
            ];
            let embed = {
                author: {
                    name: `Rob`,
                    icon_url: `${message.author.avatarURL || message.author.defaultAvatarURL}`
                },
                description: `${this.client.emojis.spinner} **Choose a Place:** ${places.map(place => `\`${place.ref}\``).join(", ")}`,
                timestamp: new Date(),
                thumbnail: {
                    url: this.client.utils.icons.thief
                },
                fields: [],
                color: this.client.utils.colors.yellow,
                footer: {
                    text: `${this.client.user.username}`,
                    icon_url: `${this.client.user.avatarURL}`
                }
            };
            places.forEach(place => {
                embed.fields.push({
                    name: `Place: ${place.full.toCamelCase()}`,
                    value: [
                        `**Maximum Payout:** ${place.max} ${this.client.emojis.cash}`,
                        `**Bounty Increase:** ${place.bounty}`
                    ].join("\n")
                });
            });
            const msg = await message.channel.createMessage({ embed });
            embed.fields = [];
            let responses = await message.channel.awaitMessages(m => m.author.id == message.author.id, { time: 10000, maxMatches: 1 });
            if(!responses.length) {
                embed.description = `${this.client.emojis.cross} No Responses was received. The Rob was **Cancelled**!`;
                return msg.edit({ embed });
            }
            if(responses[0]) responses[0].delete().catch(() => {});
            const robPlace = places.find(x => x.name.toLowerCase() == responses[0].content.toLowerCase());
            if(!robPlace) {
                embed.color = this.client.utils.colors.red;
                embed.description = `${this.client.emojis.cross} Invalid Response was received. The Rob was **Cancelled**!`;
                return msg.edit({ embed });
            }
            embed.description = `${this.client.emojis.spinner} Finding the nearest **${robPlace.full}** to Rob!`;
            embed.color = this.client.utils.colors.money;
            msg.edit({ embed });
            setTimeout(() => {
                embed.description = `${this.client.emojis.spinner} Breaking into the **${robPlace.full}**!`;
                msg.edit({ embed });
                setTimeout(() => {
                    embed.description = `${this.client.emojis.spinner} Robbing the **${robPlace.full}**! This may take a while...`;
                    msg.edit({ embed });
                    setTimeout(() => {
                        const robbedMoney = Math.floor(Math.random() * (robPlace.max - robPlace.min) + robPlace.min);
                        embed.description = `${this.client.emojis.spinner} Escaping from the **${robPlace.full}**! Payout: **${robbedMoney}** ${this.client.emojis.cash}`;
                        msg.edit({ embed });
                        setTimeout(() => {
                            const probabilityOfFail = Math.floor(Math.random() * 4);
                            userDB.dataValues.cooldowns[this.conf.name] = Date.now();
                            if(probabilityOfFail == 0 || probabilityOfFail == 1) {
                                embed.description = `${this.client.emojis.cross} You were caught while Escaping, You paid **${robbedMoney}** ${this.client.emojis.cash} to the Cops!`;
                                embed.thumbnail.url = this.client.utils.icons.handcuffs;
                                embed.color = this.client.utils.colors.red;
                                balance -= robbedMoney;
                                bounty += robPlace.bounty;
                                if(balance < 0) {
                                    let toBePaid = Math.abs(balance);
                                    balance = 0;
                                    userDB.dataValues.safeCash = parseInt(userDB.dataValues.safeCash);
                                    if(userDB.dataValues.safeCash) userDB.dataValues.safeCash -= toBePaid;
                                    if(userDB.dataValues.safeCash < 0) userDB.dataValues.safeCash = 0;
                                };
                                this.client.database.User.update({
                                    pocketCash: `${balance}`,
                                    bounty: `${bounty}`,
                                    safeCash: `${userDB.dataValues.safeCash}`,
                                    cooldowns: userDB.dataValues.cooldowns
                                }, { where: key })
                                .then((k) => {
                                    msg.edit({ embed });
                                });
                                return;
                            }
                            balance += robbedMoney;
                            bounty += robPlace.bounty;
                            this.client.database.User.update({
                                pocketCash: `${balance}`,
                                bounty: `${bounty}`,
                                cooldowns: userDB.dataValues.cooldowns
                            }, { where: key })
                            .then(() => {
                                embed.color = this.client.utils.colors.jewel;
                                embed.thumbnail.url = this.client.utils.icons.moneyBag;
                                embed.description = [
                                    `${this.client.emojis.tick} You successfully Robbed a **${robPlace.ref}**!`,
                                    ``,
                                    `__**Heist Info**__`,
                                    `**Total Payout:** ${robbedMoney} ${this.client.emojis.cash}`,
                                    `**Increase in Bounty:** ${robPlace.bounty}`,
                                    ``,
                                    `__**Your Account Info**__`,
                                    `**Balance:** ${balance} ${this.client.emojis.cash}`,
                                    `**Bounty:** ${bounty}`
                                ].join("\n");
                                return msg.edit({ embed });
                            })
                            .catch(e => {
                                responder.send({
                                    embed: this.client.embeds.error(message.author, {
                                        description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                                    })
                                });
                            });
                        }, 5000)
                    }, 10000);
                }, 3000);
            }, 2000);
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