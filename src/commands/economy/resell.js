/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "resell",
            description: "Sell an Item in your Inventory.",
            usage: "<name|id> -c [count]",
            guildOnly: false,
            aliases: ["sell"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            args: [
                { name: `item`, type: String, multiple: true, defaultOption: true, defaultValue: [] },
                { name: `count`, alias: `c`, type: Number, defaultValue: 1 }
            ],
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            let shop = this.client.utils.shop;
            let itemsOnly = new Array();
            Object.entries(shop).forEach(([key, items]) => (items.forEach(i => {
                i.category = key;
                itemsOnly.push(i);
            })));
            if(!args.item.length) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Provide a Item **Name or ID** to sell from the Inventory.`
                })
            });
            const key = { userID: message.author.id };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            userDB.dataValues.pocketCash = parseInt(userDB.dataValues.pocketCash);
            userDB.dataValues.pocketGold = parseInt(userDB.dataValues.pocketGold);
            let items = userDB.dataValues.items;
            if(!items.length) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Your Inventory is Empty!`
                })
            });
            const item = itemsOnly.find(x => (
                x.name.toLowerCase() == args.item.join(" ").toLowerCase() ||
                x.id == parseInt(args.item.join(" "))
            ));
            if(!item) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Item \`${args.item.join(" ")}\` doesn\'t exist.`
                })
            });
            const userItem = items.find(x => x.id == item.id);
            if(!userItem) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} You don\'t own \`${item.name}\`!`
                })
            });
            if(!item.resale) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} You can\'t resell \`${item.name}\`!`
                })
            });
            const sellCount = args.count;
            if(sellCount && sellCount > userItem.count) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} You only have **${userItem.count}** of \`${item.name}\`!`
                })
            });
            const checkout = item.resale * sellCount;
            if(item.gold) userDB.dataValues.pocketGold += checkout;
            else userDB.dataValues.pocketCash += checkout;
            const index = userDB.dataValues.items.map(x => x.id).indexOf(item.id);
            userDB.dataValues.items.splice(index, 1);
            if(userItem.count !== sellCount) {
                userDB.dataValues.items.push({
                    id: item.id,
                    count: (userItem.count - sellCount)
                });
            }
            this.client.database.User.update({
                pocketCash: `${userDB.dataValues.pocketCash}`,
                pocketGold: `${userDB.dataValues.pocketGold}`,
                items: userDB.dataValues.items
            }, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.success(message.author, {
                        description: [
                            `${this.client.emojis.tick} Sold!`,
                            ``,
                            `__**Bill**__`,
                            `**Item Name:** ${item.emoji} ${item.name}`,
                            `**Item Resale Cost:** ${item.resale} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`,
                            `**Sold Count:** ${sellCount}`,
                            `**Total Checkout:** ${checkout} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`
                        ].join("\n"),
                        thumbnail: { url: this.client.utils.icons.shop }
                    })
                });
            })
            .catch(() => {
                return responder.send({
                    embed: this.client.embeds.embed(message.author, {
                        description: `${this.client.emojis.cross} Couldn\'t Make that Purchase.`
                    })
                });
            });
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