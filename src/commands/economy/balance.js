/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

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

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            let user;
            if(args[0]) user = this.client.users.get(this.client.parseMention(args[0]));
            if(!user) user = message.author;
            const key = { userID: `${user.id}` };
            let userDB = await this.client.database.User.findOne({ where: key });
            if(!userDB) userDB = await this.client.database.User.create(key);
            const embed = this.client.embeds.embed(user);
            embed.author.name = `${user.tag}'s Balance`;
            embed.fields = [
                {
                    name: `Pocket`,
                    value: [
                        `**Cash:** ${userDB.pocketCash} ${this.client.emojis.cash}`,
                        `**Gold:** ${userDB.pocketGold} ${this.client.emojis.goldCash}`
                    ].join("\n"),
                    inline: true
                },
                {
                    name: `Safe`,
                    value: [
                        `**Cash:** ${userDB.safeCash} ${this.client.emojis.cash}`,
                        `**Gold:** ${userDB.safeGold} ${this.client.emojis.goldCash}`
                    ].join("\n"),
                    inline: true
                }
            ];
            responder.send({ embed });
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