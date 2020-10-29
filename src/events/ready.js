const utils = require("../utils");

module.exports = (client) => {
    utils.logger.info(`Logged in as ${client.bot.user.tag} (${client.bot.user.id})`);
}