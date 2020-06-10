/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "remove",
            description: "Adds a Todo to be Done.",
            usage: "<index> [index2]...",
            aliases: ["r", "rm", "delete", "del"],
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
            let toBeDeleted = new Array();
            args.forEach(arg => {
                if(!isNaN(arg) && parseInt(arg) > 0) toBeDeleted.push(parseInt(arg) - 1);
            });
            if(!toBeDeleted.length) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("INVALID_PARAMETER", "Index")
                })
            });
            const key = { userID: message.author.id };
            let UserDB = await this.client.database.User.findOne({ where: key });
            if(!UserDB) UserDB = await this.client.database.User.create(key);
            toBeDeleted = toBeDeleted.filter(t => t < UserDB.dataValues.todo.length)
            toBeDeleted.forEach(deleted => {
                UserDB.dataValues.todo.splice(deleted, 1);
            });
            this.client.database.User.update({
                todo: UserDB.dataValues.todo
            }, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.success(message.author, {
                        description: `${this.client.emojis.tick} Removed the Index ${toBeDeleted.map(x => `\`${x + 1}\``).join(", ") || "None"} from the Todo List!`
                    })
                });
            })
            .catch((e) => {console.log(e)
                responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Couldn\'t remove the Task!`
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