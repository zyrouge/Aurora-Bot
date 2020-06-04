/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(error, shardID) {
        const chalk = require('chalk');
        console.log(chalk.redBright(`[ ERROR (START) ]`));
        console.log(error);
        console.log(chalk.gray(`Event: error`));
        console.log(chalk.gray(`Shard: ${shardID}`));
        console.log(chalk.gray(`Logged on: ${require("../Utils/getTime")()}`));
        console.log(chalk.redBright(`[ ERROR (END) ]`));
    }
}