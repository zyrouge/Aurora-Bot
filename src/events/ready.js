/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        const chalk = require('chalk');
        console.log(`Logged in as ${chalk.greenBright(`${this.client.user.username}#${this.client.user.discriminator}`)}`);
    }
}