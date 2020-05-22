/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "inventory",
            description: "Shows your Inventory.",
            usage: "",
            guildOnly: false,
            aliases: ["inv"],
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
            const key = { userID: message.author.id };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            let items = userDB.dataValues.items;
            if(!items.length) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Your Inventory is Empty!`
                })
            });
            let pages = new Array();
            var i, j, temparray, chunk = 5;
            for (i = 0, j = items.length; i < j; i += chunk) {
                temparray = items.slice(i, i + chunk);
                pages.push(temparray);
            }
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
                        msg.removeReaction(`${this.client.emojis.right}`.replace(/<|>/g, ""), reaction.userID);
                        embed = await this.getEmbed(pages, currentPage);
                        msg.edit({ embed });
                    } else msg.removeReaction(`${this.client.emojis.right}`.replace(/<|>/g, ""), reaction.userID);
                } else if (reaction.emoji.id == `${this.client.emojis.left}`.replace(/<|>/g, "").split(":").pop()) {
                    if(pages[currentPage - 1]) {
                        currentPage -= 1;
                        msg.removeReaction(`${this.client.emojis.left}`.replace(/<|>/g, ""), reaction.userID);
                        embed = await this.getEmbed(pages, currentPage);
                        msg.edit({ embed });
                    } else msg.removeReaction(`${this.client.emojis.left}`.replace(/<|>/g, ""), reaction.userID);
                } else if(reaction.emoji.id === `${this.client.emojis.cross}`.replace(/<|>/g, "").split(":").pop()) {
                    collector.stopListening();
                }
            });
            collector.on("end", () => {
                msg.removeReactions();
            });
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
        pages[currentPage].forEach(i => {
            let shop = this.client.utils.shop;
            let itemsOnly = new Array();
            Object.entries(shop).forEach(([key, items]) => (items.forEach(i => {
                i.category = key;
                itemsOnly.push(i);
            })));
            let item = itemsOnly.find(x => x.id == i.id);
            let value = [
                `**Count:** ${i.count}`,
                `**Resale Cost:** ${item.resale ? `${item.resale} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}` : "Cannot be reselled."}`
            ];
            fields.push({
                name: `${item.emoji} ${item.id} - ${item.name}`,
                value: value.join("\n")
            })
        });
        return {
            author: {
                name: `Inventory`
            },
            color: this.client.utils.colors.fuschia,
            thumbnail: { url: this.client.utils.icons.inventory },
            timestamp: new Date(),
            fields,
            footer: {
                text: `Page ${currentPage + 1}/${pages.length}`,
                icon_url: `${this.client.user.avatarURL}`
            }
        };
    }
}

module.exports = _Command;