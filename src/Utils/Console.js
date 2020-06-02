/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports  = () => {
    const fs = require("fs");
    const path = require("path");
    const chalk = require("chalk");
    var moment = require("moment");
    require("moment-timezone");

    /* Check if folder exists */
    if(!fs.existsSync(__dirname + "/../logs")) fs.mkdirSync(__dirname + "/../logs");

    const date = moment().tz('Asia/Kolkata').format(`YYYY-MM-DD`);
    const time = moment().tz('Asia/Kolkata').format(`HH:mm:ss`);

    /* Normal */
    const normalPath = path.resolve(`src`, `logs`) + `/${date}-normal.log`;
    fs.closeSync(fs.openSync(normalPath, 'a'));
    const normalFile = fs.createWriteStream(normalPath, { flags: 'a' });

    const consoleLog = console.log;
    console.log = function(...logs) {
        logs.forEach(log => {
            consoleLog(`[${chalk.blueBright("INFO")}] ${chalk.gray(`${time}`)} ${log}`);
            normalFile.write(`[${time}] ${log}\n`)
        });
    }

    /* Warn */
    const warnPath = path.resolve(`src`, `logs`) + `/${date}-warn.log`;
    fs.closeSync(fs.openSync(warnPath, 'a'));
    const warnFile = fs.createWriteStream(warnPath, { flags: 'a' });

    const consoleWarn = console.warn;
    console.warn = function(...logs) {
        logs.forEach(log => {
            consoleWarn(`[${chalk.yellowBright("WARN")}] ${chalk.gray(`${time}`)} ${log}`);
            warnFile.write(`[${time}] ${log}\n`);
        });
    }

    /* Error */
    const errorPath = path.resolve(`src`, `logs`) + `/${date}-error.log`;
    fs.closeSync(fs.openSync(errorPath, 'a'));
    const errorFile = fs.createWriteStream(errorPath, { flags: 'a' });

    const consoleError = console.error;
    console.error = function(...logs) {
        logs.forEach(log => {
            consoleError(`[${chalk.redBright("ERRO")}] ${chalk.gray(`${time}`)} ${log}`);
            errorFile.write(`[${time}] ${log}\n`);
        });
    }
}