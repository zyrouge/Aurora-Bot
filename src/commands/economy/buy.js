/** 
 * @author ZYROUGE
 * @license MIT
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

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
                    description: `${this.client.emojis.cross} Provide a Item **Name or ID** to buy from the Shop.`
                })
            });
            const item = itemsOnly.find(x => (
                x.name.toLowerCase() == args.item.join(" ").toLowerCase() ||
                x.id == parseInt(args.item.join(" "))
            ));
            const buyCount = args.count;
            if(!item) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Item \`${args.item.join(" ")}\` doesn\'t exist in the Shop.`
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
                    description: `${this.client.emojis.cross} You don\'t have enough cash to buy **${buyCount > 1 ? `${buyCount} ${item.name.toCamelCase()}s` : `${item.name.toCamelCase()}`}**.`
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
                    description: `${this.client.emojis.cross} You cannot buy that many **${item.name.toCamelCase()}**.`
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
                            `${this.client.emojis.tick} Purchase Success!`,
                            ``,
                            `__**Bill**__`,
                            `**Item Name:** ${item.emoji} ${item.name}`,
                            `**Item Cost:** ${item.cost} ${item.gold ? this.client.emojis.goldCash : this.client.emojis.cash}`,
                            `**Purchased Count:** ${buyCount}`,
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