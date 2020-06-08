/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");
const _ = require("lodash");
class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "shop",
            description: "Shows the Shop.",
            usage: "",
            guildOnly: false,
            aliases: ["sh"],
            permission: {
                bot: ["embedLinks", "addReactions"],
                user: []
            },
            enabled: true,
            cooldown: 10
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            let shop = this.client.utils.shop;
            let itemsOnly = new Array();
            const pages = new Array();
            Object.entries(shop).forEach(([key, items]) => {
                itemsOnly = [...itemsOnly, ...items];
                const chunks = _.chunk(items, 5);
                chunks.forEach(chunk => {
                    pages.push({
                        title: key.toCamelCase(),
                        items: chunk
                    });
                });
            });
            if(!args.length) {
                let currentPage = 0;
                let embed = await this.getEmbed(pages, currentPage);
                const msg = await message.channel.createMessage({ embed });
                await msg.addReaction(`${this.client.emojis.left}`.replace(/<|>/g, ""));
                await msg.addReaction(`${this.client.emojis.right}`.replace(/<|>/g, ""));
                await msg.addReaction(`${this.client.emojis.cross}`.replace(/<|>/g, ""));
                const collector = new this.client.utils.reactionCollector.continuousReactionStream(msg,
                    (userID) => userID === message.author.id,
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
            } else {
                const item = itemsOnly.find(x => (
                    x.name.toLowerCase() == args.join(" ").toLowerCase() ||
                    x.name.toLowerCase().includes(args.join(" ").toLowerCase()) ||
                    x.id == parseInt(args[0])
                ));
                if(!item) return responder.send({
                    embed: this.client.embeds.embed(null, {
                        description: `${this.client.emojis.cross} Item \`${args[0]}\` doesn\'t exist in the Shop.`
                    })
                });
                const icon = item.emoji && item.emoji.split(":").pop().replace(">", "");
                const url = icon && !isNaN(icon) ? `https://cdn.discordapp.com/emojis/${icon}.png` : null;
                responder.send({
                    embed: this.client.embeds.embed(message.author, {
                        title: `${item.name.toCamelCase()}`,
                        description: [
                            `**ID:** ${item.id}`,
                            `**Cost:** ${item.cost} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`,
                            `**Available:** ${item.available ? this.client.emojis.tick : this.client.emojis.cross}`,
                            `**Limited:** ${item.limited ? this.client.emojis.tick : this.client.emojis.cross}`,
                            `**Resale Cost:** ${item.resale ? `${item.resale} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}` : "Cannot be reselled."}`,
                            `**Maximum Purchase Limit:** ${item.maxInInv ? item.maxInInv : "None"}`,
                            `**Increase in Success Rate:** ${item.successInc}`,
                            `**Increase in Bounty Rate:** ${item.bountyInc}`
                        ].join("\n"),
                        thumbnail: { url }
                    })
                });
            }
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }

    async getEmbed(pages, currentPage) {
        const fields = new Array();
        pages[currentPage].items.forEach(item => {
            let value = [
                `**Cost:** ${item.cost} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`
            ];
            fields.push({
                name: `${item.emoji} ${item.id} - ${item.name}`,
                value: value.join("\n")
            })
        });
        return {
            author: {
                name: `Shop`,
                icon_url: this.client.utils.icons.shop
            },
            title: `${pages[currentPage].title}`,
            color: this.client.utils.colors.fuschia,
            timestamp: new Date(),
            fields,
            footer: {
                text: `Page ${currentPage + 1}/${pages.length} • a&shop [name|id]`,
                icon_url: `${this.client.user.avatarURL}`
            }
        };
    }
}

module.exports = _Command;