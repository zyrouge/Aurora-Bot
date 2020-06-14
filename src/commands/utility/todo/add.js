/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora") || global.Aurora;

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            description: "Adds a Todo to be Done.",
            usage: "<task>, [task2]...",
            aliases: ["a"],
            enabled: true
        });
    }

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            if(!args.length) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("NO_PARAMETER_PROVIDED", "Task")
                })
            });
            const key = { userID: message.author.id };
            let UserDB = await this.client.database.User.findOne({ where: key });
            if(!UserDB) UserDB = await this.client.database.User.create(key);
            const toBeAdded = args.join(" ").split(",");
            toBeAdded.forEach(added => UserDB.dataValues.todo.push(added));
            this.client.database.User.update({
                todo: UserDB.dataValues.todo
            }, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.success(message.author, {
                        description: `${this.client.emojis.tick} Added **${toBeAdded.length}** Task${toBeAdded.length ? "" : "s"} to the List!`
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