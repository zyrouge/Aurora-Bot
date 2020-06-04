const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "",
            description: "",
            usage: "",
            guildOnly: true,
            aliases: [],
            permission: {
                bot: [],
                user: []
            },
            enabled: false
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
    }
}

module.exports = _Command;