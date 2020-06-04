const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "tictactoe",
            description: "Play Tic-Tac-Toe with the Bot or friends!",
            usage: "[user]",
            guildOnly: false,
            aliases: ["ttt", "xo"],
            permission: {
                bot: ["embedLinks", "addReactions"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        const embed = this.client.embeds.embed();
        const X_ICON = "❌";
        const O_ICON = "⭕";
        let XO = [
            [ "1", "2", "3" ],
            [ "4", "5", "6" ],
            [ "7", "8", "9" ]
        ];
        embed.description = `\`\`\`${this.formatXO(XO, X_ICON, O_ICON)}\`\`\``;
        const msg = await responder.send({ embed });
        await msg.addReaction(":one:");
        await msg.addReaction(":two:");
        await msg.addReaction(":three:");
        await msg.addReaction(":four:");
        await msg.addReaction(":five:");
        await msg.addReaction(":six:");
        await msg.addReaction(":seven:");
        await msg.addReaction(":eight:");
        await msg.addReaction(":nine:");
    }

    formatXO(XO, X_ICON, O_ICON) {
        return [
            `     |     |     `,
            `  ${XO[0][0]}  |  ${XO[0][1]}  |  ${XO[0][2]}  `,
            `_____|_____|_____`,
            `     |     |     `,
            `  ${XO[1][0]}  |  ${XO[1][1]}  |  ${XO[1][2]}  `,
            `_____|_____|_____`,
            `     |     |     `,
            `  ${XO[2][0]}  |  ${XO[2][1]}  |  ${XO[2][2]}  `,
            `     |     |     `
        ].map(row => `   ${row}   `).join("\n");
    }
}

module.exports = _Command;