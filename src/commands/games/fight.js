/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora") || global.Aurora;
var moment = require("moment");
require("moment-duration-format");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "fight",
            description: "Fight with Bot or just challenge your Friend. You gain 1000 if you win against bot and loose 400 if bot defeats you. You gain/loose 1000 with friends.",
            usage: "[user]",
            guildOnly: false,
            aliases: ["battle"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        let secondUser = message.mentions[0];
        try {
            const userGame = this.getUserGame(message.author.id);
            if(userGame) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("ALREADY_INGAME")
                })
            });
            const key = { userID: message.author.id };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            const cooldown = 45 * 60 * 1000;
            if(userDB.dataValues.cooldowns[this.conf.name] && Date.now() - userDB.dataValues.cooldowns[this.conf.name] < cooldown) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SLOWDOWN_MSG", message.author.username, moment.duration(cooldown - (Date.now() - userDB.dataValues.cooldowns[this.conf.name])).format('H[h] m[m] s[s]'), this.conf.name.toCamelCase())
                })
            });
            this.startUserGame(message.author.id);
            userDB.dataValues.pocketCash = parseInt(userDB.dataValues.pocketCash);
            let otherUserDB;
            let otherKey;
            let timeoutOne = 5000;
            if(secondUser) {
                const secondUserGame = this.getUserGame(secondUser.id);
                if(secondUserGame) return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("USER_ALREADY_INGAME", secondUser.username, secondUserGame)
                    })
                });
                otherKey = { userID: secondUser.id };
                otherUserDB = await this.client.database.User.findOne({ where: otherKey });
                if(!otherUserDB) otherUserDB = await this.client.database.User.create(otherKey);
                otherUserDB.dataValues.pocketCash = parseInt(otherUserDB.dataValues.pocketCash);
                if(otherUserDB.dataValues.cooldowns[this.conf.name] && Date.now() - userDB.dataValues.cooldowns[this.conf.name] < cooldown) return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("FOUGHT_RECENTLY", secondUser.username, moment.duration(cooldown - (Date.now() - userDB.dataValues.cooldowns[this.conf.name])).format('H[h] m[m] s[s]'))
                    })
                });
                if(userDB.dataValues.pocketCash < 1000) return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("NO_CASH_TO_BET", message.author.username, 1000)
                    })
                });
                if(otherUserDB.dataValues.pocketCash < 1000) return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("NO_CASH_TO_BET", secondUser.username, 1000)
                    })
                });
            }
            let embed = {
                author: {
                    name: translator.translate("FIGHT"),
                    icon_url: `${message.author.avatarURL || message.author.defaultAvatarURL}`
                },
                description: null,
                fields: [],
                thumbnail: { url: this.client.utils.icons.fist },
                color: this.client.utils.colors.fuschia,
                timestamp: new Date(),
                footer: {
                    text: `${this.client.user.username}`,
                    icon_url: `${this.client.user.avatarURL}`
                }
            };
            let msg;
            if(secondUser) {
                const selection = ["accept", "decline"];
                embed.description = translator.translate("FIGHT_WAITING_REPLY", secondUser.username, selection);
                msg = await message.channel.createMessage({ embed });
                const collector = await message.channel.awaitMessages(msg => (
                    msg.author.id == secondUser.id &&
                    selection.includes(msg.content.toLowerCase().trim())
                ), {
                    time: 20000,
                    maxMatches: 1
                });
                if(!collector[0]) {
                    embed.description = translator.translate("NO_RESPONSE", secondUser.username, this.conf.name);
                    msg.edit({ embed });
                    return;
                }
                const choosenMovement = collector[0].content.toLowerCase().trim();
                collector[0].delete().catch(() => {});
                if(choosenMovement == "decline") {
                    embed.description = translator.translate("DECLINED_MSG", secondUser.username);
                    msg.edit({ embed });
                    return;
                }
                this.startUserGame(secondUser.id);
                timeoutOne = 500;
            } else {
                embed.description = translator.translate("FINDING_NEARBY_ENEMIES");
                msg = await message.channel.createMessage({ embed });
            }
            setTimeout(() => {
                const nearbyEnemy = Math.floor(Math.random() * 6);
                if(!secondUser && (nearbyEnemy == 0 || nearbyEnemy == 1)) {
                    embed.description = translator.translate("NO_NEARBY_ENEMIES");
                    msg.edit({ embed });
                    return this.endUserGame(message.author.id);
                }
                const maxStrength = 400;
                let player = maxStrength;
                let enemy = maxStrength;
                let giveupOne = false;
                let giveupTwo = false;
                let reason = false;
                const enemyName = secondUser ? secondUser.username : this.randomName();
                const logs = new Array;
                const emotes = {
                    punch: '👊',
                    kick: '💢',
                    defend: '🛡️',
                    miss: '⚠️',
                    nothing: '🚫',
                    ticket: '🎫',
                    time: '⏲️'
                };
                const plurals = {
                    punch: 'punches',
                    kick: 'kicks',
                    defend: 'defends'
                };
                logs.push(`${emotes.ticket} Match has been decided between **${message.author.username}** and **${enemyName}**!`);
                embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                embed.description = `${this.client.emojis.spinner} **${enemyName}** has challenged you! Challenge accepted.\nPreparing the Ring...`;
                msg.edit({ embed });
                setTimeout(async () => {
                    const playerMoves = ["punch", "kick", "defend", "abort"];
                    const enemyMoves = ["punch", "kick", "defend"];
                    if(secondUser) enemyMoves.push("abort");
                    logs.push(`${emotes.time} Match started! **${message.author.username}** vs. **${enemyName}**`);
                    while(!giveupOne && !giveupTwo && player > 0 && enemy > 0) {
                        if(player < 0 || enemy < 0) break;
                        embed.description = `${this.client.emojis.clock} **${message.author.username}**, Use **${playerMoves.map(move => `\`${move}\``).join(", ")}** to fight! You have 20 seconds to choose.`;
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        msg.edit({ embed });
                        let resultOne = await this.playPlayer(message, message.author.id, playerMoves)
                        .catch(error => {
                            reason = error;
                            giveupOne = true;
                            return;
                        });
                        if(giveupOne) break; // safety first
                        if(player < 0 || enemy < 0) break;
                        if(resultOne.missed) {
                            logs.push(`${this.client.emojis.up} **${message.author.username}** ${plurals[resultOne.move]} but it missed! ${emotes.miss}`);
                        } else if(resultOne.increase) {
                            player = player + resultOne.increase > maxStrength ? maxStrength : player + resultOne.increase;
                            logs.push(`${this.client.emojis.up} **${message.author.username}** ${plurals[resultOne.move]} and gains **${resultOne.increase}HP** ${emotes[resultOne.move]}`);
                        } else if (resultOne.decrease) {
                            enemy = enemy - resultOne.decrease < 0 ? 0 : enemy - resultOne.decrease;
                            logs.push(`${this.client.emojis.up} **${message.author.username}** ${plurals[resultOne.move]} and deals **${resultOne.decrease}HP** ${emotes[resultOne.move]}`);
                        } else {
                            logs.push(`${this.client.emojis.down} **${message.author.username}** deals and heals nothing ${emotes.nothing}`);
                        }
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        embed.description = `${this.client.emojis.spinner} **${enemyName}** is choosing a Move...`;
                        if(secondUser) embed.description = `${this.client.emojis.clock} **${enemyName}**, Use **${enemyMoves.map(move => `\`${move}\``).join(", ")}** to fight! You have 20 seconds to choose.`;
                        msg.edit({ embed });
                        let resultTwo;
                        if(secondUser) {
                            resultTwo = await this.playPlayer(message, secondUser.id, playerMoves)
                            .catch(error => {
                                reason = error;
                                giveupTwo = true;
                                return;
                            });
                        } else {
                            resultTwo = await this.playEnemy(message, enemyMoves);
                        }
                        if(giveupTwo) break; // safety second
                        if(resultTwo.missed) {
                            logs.push(`${this.client.emojis.down} **${enemyName}** ${plurals[resultTwo.move]} but it missed! ${emotes.miss}`);
                        } else if(resultTwo.decrease) {
                            player = player - resultTwo.decrease < 0 ? 0 : player - resultTwo.decrease;
                            logs.push(`${this.client.emojis.down} **${enemyName}** ${plurals[resultTwo.move]} and deals **${resultTwo.decrease}HP** ${emotes[resultTwo.move]}`);
                        } else if(resultTwo.increase) {
                            enemy = enemy + resultTwo.increase > maxStrength ? maxStrength : enemy + resultTwo.increase;
                            logs.push(`${this.client.emojis.down} **${enemyName}** ${plurals[resultTwo.move]} and gains **${resultTwo.increase}HP** ${emotes[resultTwo.move]}`);
                        } else {
                            logs.push(`${this.client.emojis.down} **${enemyName}** deals and heals nothing ${emotes.nothing}`);
                        }
                        if(player < 0 || enemy < 0) break;
                    }
                    if(giveupOne && reason == "nomove") {
                        logs.push(`${this.client.emojis.lose} **${message.author.username}** hides from **${enemyName}**.`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        if(secondUser) {
                            embed.description = [
                                `Seems like **${message.author.username}** didn\'t use any move. **${enemyName} won** the Fight!`,
                                `**${message.author.username}** lost **1000** ${this.client.emojis.cash}`,
                                `**${enemyName}** gained **1000** ${this.client.emojis.cash}`
                            ].join("\n");
                            otherUserDB.dataValues.pocketCash = userDB.dataValues.pocketCash + 1000;
                            userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 1000 < 0 ? 0 : userDB.dataValues.pocketCash - 1000;
                        } else {
                            embed.description = `Seems like you didn\'t use any move. **${enemyName} won** the Fight!\nYou lost **400** ${this.client.emojis.cash}`;
                            userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 400 < 0 ? 0 : userDB.dataValues.pocketCash - 400;
                        }
                        msg.edit({ embed });
                    } else if(giveupOne && reason == "aborted") {
                        logs.push(`${this.client.emojis.lose} **${message.author.username}** gives up.`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        if(secondUser) {
                            embed.description = [
                                `Seems like **${message.author.username}** is scared. **${enemyName} won** the Fight!`,
                                `**${message.author.username}** lost **1000** ${this.client.emojis.cash}`,
                                `**${enemyName}** gained **1000** ${this.client.emojis.cash}`
                            ].join("\n");
                            otherUserDB.dataValues.pocketCash = userDB.dataValues.pocketCash + 1000;
                            userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 1000 < 0 ? 0 : userDB.dataValues.pocketCash - 1000;
                        } else {
                            embed.description = `Seems like you are scared. **${enemyName} won** the Fight!\nYou lost **400** ${this.client.emojis.cash}`;
                            userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 400 < 0 ? 0 : userDB.dataValues.pocketCash - 400;
                        }
                        msg.edit({ embed });
                    } else if(giveupTwo && reason == "nomove") {
                        logs.push(`${this.client.emojis.lose} **${enemyName}** hides from **${message.author.username}**.`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        embed.description = [
                            `Seems like **${enemyName}** didn\'t use any move. **${message.author.username} won** the Fight!`,
                            `**${enemyName}** lost **1000** ${this.client.emojis.cash}`,
                            `**${message.author.username}** gained **1000** ${this.client.emojis.cash}`
                        ].join("\n");
                        userDB.dataValues.pocketCash = userDB.dataValues.pocketCash + 1000;
                        otherUserDB.dataValues.pocketCash = otherUserDB.dataValues.pocketCash - 1000 < 0 ? 0 : otherUserDB.dataValues.pocketCash - 1000;
                        msg.edit({ embed });
                    } else if(giveupTwo && reason == "aborted") {
                        logs.push(`${this.client.emojis.lose} **${enemyName}** gives up.`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        embed.description = [
                            `Seems like **${enemyName}** is scared. **${message.author.username} won** the Fight!`,
                            `**${enemyName}** lost **1000** ${this.client.emojis.cash}`,
                            `**${message.author.username}** gained **1000** ${this.client.emojis.cash}`
                        ].join("\n");
                        userDB.dataValues.pocketCash = userDB.dataValues.pocketCash + 1000;
                        otherUserDB.dataValues.pocketCash = otherUserDB.dataValues.pocketCash - 1000 < 0 ? 0 : otherUserDB.dataValues.pocketCash - 1000;
                        msg.edit({ embed });
                    } else if(player > enemy) {
                        logs.push(`${this.client.emojis.win} **${message.author.username}** wins!`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        embed.description = `**You won the Fight!** You gained **1000** ${this.client.emojis.cash}`;
                        userDB.dataValues.pocketCash = userDB.dataValues.pocketCash + 1000;
                        if(secondUser) {
                            embed.description = [
                                `**${message.author.username} won** the Fight! Better luck next time **${enemyName}**.`,
                                `**${enemyName}** lost **1000** ${this.client.emojis.cash}`,
                                `**${message.author.username}** gained **1000** ${this.client.emojis.cash}`
                            ].join("\n");
                            otherUserDB.dataValues.pocketCash = otherUserDB.dataValues.pocketCash - 1000 < 0 ? 0 : otherUserDB.dataValues.pocketCash - 1000;
                        }
                        msg.edit({ embed });
                    } else {
                        logs.push(`${this.client.emojis.win} **${enemyName}** wins!`);
                        embed.fields = this.getFields(player, enemy, message.author, enemyName, logs);
                        embed.description = `**${enemyName} won the Fight!** You lost **400** ${this.client.emojis.cash}`;
                        userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 400 < 0 ? 0 : userDB.dataValues.pocketCash - 400;
                        if(secondUser) {
                            embed.description = [
                                `**${enemyName} won** the Fight! Better luck next time **${message.author.username}**.`,
                                `**${message.author.username}** lost **1000** ${this.client.emojis.cash}`,
                                `**${enemyName}** gained **1000** ${this.client.emojis.cash}`
                            ].join("\n");
                            userDB.dataValues.pocketCash = userDB.dataValues.pocketCash - 1000 < 0 ? 0 : userDB.dataValues.pocketCash - 1000;
                            otherUserDB.dataValues.pocketCash = otherUserDB.dataValues.pocketCash + 1000;
                        }
                        msg.edit({ embed });
                    }
                    userDB.dataValues.cooldowns[this.conf.name] = Date.now();
                    this.client.database.User.update({
                        pocketCash: `${userDB.dataValues.pocketCash}`,
                        cooldowns: userDB.dataValues.cooldowns
                    }, { where: key })
                    .catch(() => {});
                    this.client.cache.games.delete(key.userID);
                    if(secondUser) {
                        this.client.cache.games.delete(otherKey.userID);
                        otherUserDB.dataValues.cooldowns[this.conf.name] = Date.now();
                        this.client.database.User.update({
                            pocketCash: `${otherUserDB.dataValues.pocketCash}`,
                            cooldowns: otherUserDB.dataValues.cooldowns
                        }, { where: otherKey })
                        .catch(() => {});
                    }
                    this.endUserGame(message.author.id);
                    this.endUserGame(secondUser.id);
                    return;
                }, 3000);
            }, timeoutOne);
        } catch(e) {
            this.endUserGame(message.author.id);
            if(secondUser) this.endUserGame(secondUser.id);
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }

    playPlayer(message, id, moves) {
        return new Promise(async (resolve, reject) => {
            const damageDelt = await this.getPlayerMove(message, id, moves).catch(e => reject(e));
            resolve(damageDelt);
        });
    }

    playEnemy(message, moves) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const enemyMove = moves.random();
                const damageDelt = this.getDamage(enemyMove);
                resolve(damageDelt);
            }, 3000)
        });
    }

    getPlayerMove(message, id, moves) {
        return new Promise(async (resolve, reject) => {
            const collector = await message.channel.awaitMessages(msg => (
                msg.author.id == id &&
                moves.includes(msg.content.toLowerCase().trim())
            ), {
                time: 20000,
                maxMatches: 1
            });
            if(!collector[0]) {
                reject("nomove");
                return;
            }
            const choosenMovement = collector[0].content.toLowerCase().trim();
            collector[0].delete().catch(() => {});
            if(choosenMovement == "abort") {
                reject("aborted");
                return;
            };
            const damageDelt = this.getDamage(choosenMovement);
            resolve(damageDelt);
            return;
        });
    }

    getDamage(move) {
        if(move == "punch") return {
            decrease: Math.floor(Math.random() * (40 - 20) + 20),
            increase: 0,
            move: "punch",
            missed: false
        };
        else if(move == "kick") {
            const a = Math.floor(Math.random() * 2);
            if(a == 0) {
                return {
                    increase: 0,
                    decrease: Math.floor(Math.random() * (65 - 40) + 40),
                    move: "kick",
                    missed: false
                }
            } else return {
                increase: 0,
                decrease: 0,
                move: "kick",
                missed: true
            };
        }
        else if(move == "defend") return {
            increase: Math.floor(Math.random() *(40 - 20) + 20),
            decrease: 0,
            move: "defend",
            missed: false
        };
        else return {
            decrease: Math.floor(Math.random() * (40 - 20) + 20),
            increase: 0,
            move: "none",
            missed: false
        };
    }

    getFields(player, enemy, user, enemyName, logs) {
        let copiedLogs = [...logs].reverse();
        return [
            {
                name: `Logs`,
                value: copiedLogs.splice(0, 5).join("\n")
            },
            {
                name: `Health`,
                value: [
                    `**${user.username}:** ${player}HP`,
                    `**${enemyName}:** ${enemy}HP`
                ].join("\n")
            }
        ]
    }

    randomName() {
        return [
            'Leona Everett',
            'Erica Harmon',
            'Nora Berry',
            'Kristina Byrd',
            'Scarlett Harvey',
            'Amina Pratt',
            'Rachel Tapia',
            'April Barnett',
            'Esther Carr',
            'Paula Estrada',
            'Harold Olsen',
            'Russell Giles',
            'Myles Nunez',
            'Dominic Guerra',
            'Tommy Weiss',
            'Jamal Wallace',
            'Glenn Weaver'
        ].random();
    }

    getUserGame(ID) {
        return this.client.cache.games.get(ID, this.conf.name);
    }

    startUserGame(ID) {
        return this.client.cache.games.set(ID, this.conf.name);
    }

    endUserGame(ID) {
        return this.client.cache.games.delete(ID, this.conf.nam);
    }
}

module.exports = _Command;