/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "edit",
            description: "Adds a Todo to be Done.",
            usage: "<index> <new task>",
            aliases: ["e"],
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            if(!args[0] || !args[1]) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Provide some Index and Task to be edited!`
                })
            });
            if(isNaN(args[0])) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Index must be a Number!`
                })
            });
            const key = { userID: message.author.id };
            let UserDB = await this.client.database.User.findOne({ where: key });
            if(!UserDB) UserDB = await this.client.database.User.create(key);
            if(!UserDB.dataValues.todo[parseInt(args[0]) - 1]) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} **Task ${args[0]}** doesn\'t Exist in the List!`
                })
            });
            UserDB.dataValues.todo[parseInt(args[0]) - 1] = args.slice(1).join(" ");
            this.client.database.User.update({
                todo: UserDB.dataValues.todo
            }, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.success(message.author, {
                        description: `${this.client.emojis.tick} Edited **Task ${args[0]}** in the List!`
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
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;