/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "buy",
            description: "Buy an Item from the Shop.",
            usage: "<name|id> -c [count]",
            guildOnly: false,
            aliases: ["purchase"],
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
            const item = itemsOnly.find(x => (
                x.name.toLowerCase() == args.item.join(" ").toLowerCase() ||
                x.id == parseInt(args.item.join(" "))
            ));
            const buyCount = args.count;
            if(!item) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("INVALID_ITEM_NAME", args.item.join(" "))
                })
            });
            const key = { userID: message.author.id };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            userDB.dataValues.pocketCash = parseInt(userDB.dataValues.pocketCash);
            userDB.dataValues.pocketGold = parseInt(userDB.dataValues.pocketGold);
            if(
                (!item.gold && userDB.dataValues.pocketCash < item.cost * buyCount) ||
                (item.gold && userDB.dataValues.pocketGold < item.cost * buyCount)
            ) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("NO_MONEY_BUY_COUNT", buyCount, item.name.toCamelCase())
                })
            });
            let existInHisAcc = userDB.dataValues.items.find(x => x.id == item.id);
            if(
                !!item.maxInInv &&
                (
                    (existInHisAcc && (existInHisAcc.count + buyCount > item.maxInInv)) ||
                    buyCount > item.maxInInv
                )
            ) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: translator.translate("PURCHASE_EXCEED", item.name.toCamelCase())
                })
            });
            const checkout = item.cost * buyCount;
            if(item.gold) userDB.dataValues.pocketGold -= checkout;
            else userDB.dataValues.pocketCash -= checkout;
            if(existInHisAcc) {
                existInHisAcc.count += buyCount;
                const index = userDB.dataValues.items.map(x => x.id).indexOf(item.id);
                userDB.dataValues.items.splice(index, 1, existInHisAcc);
            } else {
                userDB.dataValues.items.push({
                    id: item.id,
                    count: buyCount
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
                            translator.translate("PURCHASE_SUCCESS"),
                            "",
                            `__**${translator.translate("BILL")}**__`,
                            `**${translator.translate("ITEM_NAME")}:** ${item.emoji} ${item.name}`,
                            `**${translator.translate("ITEM_COST")}:** ${item.cost} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`,
                            `**${translator.translate("PURCHASED_COUNT")}:** ${buyCount}`,
                            `**${translator.translate("TOTAL_CHECKOUT")}:** ${checkout} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`
                        ].join("\n"),
                        thumbnail: { url: this.client.utils.icons.shop }
                    })
                });
            })
            .catch(() => {
                return responder.send({
                    embed: this.client.embeds.embed(message.author, {
                        description: translator.translate("COULDNT_MAKE_PAYMENT")
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