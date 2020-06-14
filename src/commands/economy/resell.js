/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            let shop = this.client.utils.shop;
            let itemsOnly = new Array();
            Object.entries(shop).forEach(([key, items]) => (items.forEach(i => {
                i.category = key;
                itemsOnly.push(i);
            })));
            if(!args.item.length) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("PROVIDE_ITEM_NAME")
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
                    description: translator.translate("EMPTY_INVENTORY")
                })
            });
            const item = itemsOnly.find(x => (
                x.name.toLowerCase() == args.item.join(" ").toLowerCase() ||
                x.id == parseInt(args.item.join(" "))
            ));
            if(!item) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("INVALID_ITEM_NAME", args.item.join(" "))
                })
            });
            const userItem = items.find(x => x.id == item.id);
            if(!userItem) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("DONT_OWN_ITEM", item.name)
                })
            });
            if(!item.resale) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("NO_RESELL", item.name)
                })
            });
            const sellCount = args.count;
            if(sellCount && sellCount > userItem.count) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("ONLY_HAVE_ITEM", userItem.count, item.name)
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
                            `${this.client.emojis.tick} ${translator.translate("SOLD")}!`,
                            ``,
                            `__**${translator.translate("BILL")}**__`,
                            `**${translator.translate("ITEM_NAME")}:** ${item.emoji} ${item.name}`,
                            `**${translator.translate("ITEM_RESALE_COST")}:** ${item.resale} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`,
                            `**${translator.translate("SOLD_COUNT")}:** ${sellCount}`,
                            `**${translator.translate("TOTAL_CHECKOUT")}:** ${checkout} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`
                        ].join("\n"),
                        thumbnail: { url: this.client.utils.icons.shop }
                    })
                });
            })
            .catch(() => {
                return responder.send({
                    embed: this.client.embeds.embed(message.author, {
                        description: translator.translate("PURCHASE_FAILED")
                    })
                });
            });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }
}

module.exports = _Command;