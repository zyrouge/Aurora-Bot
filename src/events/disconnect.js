/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        const chalk = require('chalk');
        console.log(chalk.yellowBright(`[ WARN (START) ]`));
        console.log(`All Bot shards have been Disconnected.`);
        console.log(chalk.gray(`Event: disconnect`));
        console.log(chalk.gray(`Logged on: ${require("../Utils/getTime")()}`));
        console.log(chalk.yellowBright(`[ WARN (END) ]`));
    }
}