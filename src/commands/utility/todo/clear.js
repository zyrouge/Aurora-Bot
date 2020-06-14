/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "clear",
            description: "Clears the Todo List.",
            usage: "",
            aliases: ["c"],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            const key = { userID: message.author.id };
            let UserDB = await this.client.database.User.findOne({ where: key });
            if(!UserDB) UserDB = await this.client.database.User.create(key);
            this.client.database.User.update({
                todo: []
            }, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.success(message.author, {
                        description: `${this.client.emojis.tick} Cleared the Todo List!`
                    })
                });
            })
            .catch(() => {
                responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Couldn\'t add the Task!`
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