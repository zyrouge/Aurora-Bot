const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const pkg = require(path.resolve("package.json"));
const yaml = require("yaml");
const settingsFile = fs.readFileSync(path.resolve("options.yaml"), 'utf8');
const settings = yaml.parse(settingsFile);

module.exports = () => {
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Starting ${chalk.magentaBright(`Aurora v${pkg.version}`)}\n`);
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`${chalk.gray(`</> Made by ZYROUGE | https://github.com/zyrouge`)}\n`);
    process.stdout.write(`${chalk.gray(`[@] Source Code: https://github.com/zyrouge/aurora-bot`)}\n`);
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Environment - ${chalk.cyanBright(`${process.env.NODE_ENV || "unknown"}`)}\n`);

    if(settings.update.autoupdate) {
        const UPDATER = require(path.resolve("src", "Utils", "Autoupdater"));
        UPDATER.checkVersions()
        .then(info => {
            if(info.same) return process.stdout.write(`[${chalk.redBright("BOOT")}] Bot up-to date\n`);
            process.stdout.write(`[${chalk.redBright("BOOT")}] Updating bot to ${chalk.bgRedBright(`v${info.latest}`)}\n`);
            UPDATER.updateMaster()
            .then(() => {
                process.stdout.write(`[${chalk.redBright("BOOT")}] Updated bot to ${chalk.bgRedBright(`v${info.latest}`)}\n`);
                process.stdout.write(`[${chalk.redBright("BOOT")}] Exiting... (Manually restart it if needed)\n`);
                process.exit();
            });
        })
        .catch(e => {
            process.stdout.write(`[${chalk.redBright("BOOT")}] Failed to update with reason ${e}\n`);
        })
    } else process.stdout.write(`[${chalk.redBright("BOOT")}] Skipped Updating\n`);

    process.stdout.write(`[${chalk.redBright("BOOT")}] Building bot...\n`);
}