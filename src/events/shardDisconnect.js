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
        console.log(chalk.yellowBright(`[ WARN (START) ]`));
        if(error) console.log(error);
        console.log(chalk.gray(`Event: shardDisconnect`));
        console.log(chalk.gray(`Shard: ${shardID}`));
        console.log(chalk.gray(`Logged on: ${require("../Utils/getTime")()}`));
        console.log(chalk.yellowBright(`[ WARN (END) ]`));
    }
}