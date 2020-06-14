/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, Utils } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "balance",
            description: "Shows your Current Balance.",
            usage: "[user]",
            guildOnly: false,
            aliases: ["bal", "bank", "wallet", "currency"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            let user;
            if(args[0]) user = this.client.users.get(this.client.parseMention(args[0]));
            if(!user) user = message.author;
            const key = { userID: `${user.id}` };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            const embed = this.client.embeds.embed(user);
            embed.author.name = `${user.tag}'s ${translator.translate("BALANCE")}`;
            embed.fields = [
                {
                    name: translator.translate("POCKET"),
                    value: [
                        `**${translator.translate("CASH")}:** ${userDB.pocketCash} ${Utils.emojis.cash}`,
                        `**${translator.translate("GOLD")}:** ${userDB.pocketGold} ${Utils.emojis.goldCash}`
                    ].join("\n"),
                    inline: true
                },
                {
                    name: `Safe`,
                    value: [
                        `**${translator.translate("CASH")}:** ${userDB.safeCash} ${Utils.emojis.cash}`,
                        `**${translator.translate("GOLD")}:** ${userDB.safeGold} ${Utils.emojis.goldCash}`
                    ].join("\n"),
                    inline: true
                }
            ];
            responder.send({ embed });
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