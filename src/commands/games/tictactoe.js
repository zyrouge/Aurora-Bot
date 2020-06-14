const { Command } = require("aurora") || global.Aurora;
const { createCanvas, loadImage } = require("canvas");

/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "tictactoe",
            description: "Play Tic-Tac-Toe with the Bot or friends!",
            usage: "[user]",
            guildOnly: false,
            aliases: ["ttt", "xo"],
            permission: {
                bot: ["embedLinks", "addReactions"],
                user: []
            },
            enabled: true,
            cooldown: 60
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const userOne = message.author;
            const userTwo = {
                username: "kok",
                id: "kok"
            };

            const emotes = {
                x: "🇽",
                o: "🇴",
                false: "⬜",
                ticket: '🎫',
                time: '⏲️'
            };

            let XO = Array(3).fill(Array(3).fill(false));

            const logs = new Array();

            logs.push(`${emotes.time} Match decided between **${userOne.username}** and **${userTwo.username}**`);
            const msg = await responder.send(this.getEmbed(XO, emotes, `TicTacToe`, logs));
            await msg.addReaction("1️⃣");
            await msg.addReaction("2️⃣");
            await msg.addReaction("3️⃣");
            await msg.addReaction("4️⃣");
            await msg.addReaction("5️⃣");
            await msg.addReaction("6️⃣");
            await msg.addReaction("7️⃣");
            await msg.addReaction("8️⃣");
            await msg.addReaction("9️⃣");
            await msg.addReaction("❌");
            logs.push(`${emotes.ticket} Match started between **${userOne.username}** and **${userTwo.username}**`);

            const players = new Array();
            if(userOne) players.push(userOne);
            if(userTwo) players.push(userTwo);
            console.log(players);

            const collector = new this.client.utils.reactionCollector.continuousReactionStream(msg,
                (userID) => (players.map(x => x.id).includes(userID)),
                {
                    maxMatches: 25,
                    time: 60000
                }
            );
            collector.on("reacted", async (reaction) => {
                if (reaction.emoji.id == `${this.client.emojis.right}`.replace(/<|>/g, "").split(":").pop()) {
                    if(pages[currentPage + 1]) {
                        currentPage += 1;
                        msg.removeReaction(`${this.client.emojis.right}`.replace(/<|>/g, ""), reaction.userID).catch(() => {});
                        embed = await this.getEmbed(pages, currentPage);
                        msg.edit({ embed });
                    } else msg.removeReaction(`${this.client.emojis.right}`.replace(/<|>/g, ""), reaction.userID).catch(() => {});
                } else if (reaction.emoji.id == `${this.client.emojis.left}`.replace(/<|>/g, "").split(":").pop()) {
                    if(pages[currentPage - 1]) {
                        currentPage -= 1;
                        msg.removeReaction(`${this.client.emojis.left}`.replace(/<|>/g, ""), reaction.userID).catch(() => {});
                        embed = await this.getEmbed(pages, currentPage);
                        msg.edit({ embed });
                    } else msg.removeReaction(`${this.client.emojis.left}`.replace(/<|>/g, ""), reaction.userID).catch(() => {});
                } else if(reaction.emoji.id === `${this.client.emojis.cross}`.replace(/<|>/g, "").split(":").pop()) {
                    collector.stopListening();
                }
            });
            collector.on("end", () => {
                msg.removeReactions().catch(() => {});
            });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }

    formatXO(XO, ICON) {
        return (
`${ICON[XO[0][0]]}${ICON[XO[0][1]]}${ICON[XO[0][2]]}
${ICON[XO[1][0]]}${ICON[XO[1][1]]}${ICON[XO[1][2]]}
${ICON[XO[2][0]]}${ICON[XO[2][1]]}${ICON[XO[2][2]]}`
        );
    }

    getEmbed(XO, ICON, title, logs) {
        let copiedLogs = [...logs].reverse();
        return {
            embed: {
                title,
                fields: [
                    {
                        name: `Logs`,
                        value: copiedLogs.splice(0, 5).join("\n")
                    },
                    {
                        name: `Board`,
                        value: `${this.formatXO(XO, ICON)}`
                    }
                ]
            }
        };
    }

}

module.exports = _Command;