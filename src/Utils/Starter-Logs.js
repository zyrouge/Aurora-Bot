const chalk = require("chalk");
const pkg = require("../../package.json");

// const ascii = {
//     aurora: 
//         "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMMMMMmsodMMMMMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMMMMN.   dMMMMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMMMN-    `mMMMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMMM:      .NMMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMM+        -NMMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMo    :o    /MMMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMy    .NM/    +MMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMd    `mMMM-    sMMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMm`    dMMMMN.    hMMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMMN.    yMMMMMMd`   `dMMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMMN-    oMMMMMMMMh    .NMMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMMM:    /MMMMMMMMMMs    -NMMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMM/    -MMMMMMMMMMMM/    /MMMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMMo    .NMMMMMMMMMMMMM:    +MMMMMMMMMMMM\n" +
//         "MMMMMMMMMMMy    `dMMMMMMMMMMMMMMN.    sMMMMMMMMMMM\n" +
//         "MMMMMMMMMMh     hMMMMMMMMMMMMMMMMm`    hMMMMMMMMMM\n" +
//         "MMMMMMMMMd`     ``````````````````     `dMMMMMMMMM\n" +
//         "MMMMMMMMm`                              `mMMMMMMMM\n" +
//         "MMMMMMMN-   .-------------------------..-oNMMMMMMM\n" +
//         "MMMMMMM:   :MMMMMMMMMMMMMMMMMMMMMMMMMNsooosMMMMMMM\n" +
//         "MMMMMM/   -NMMMMMMMMMMMMMMMMMMMMMMMMMMNsoooyMMMMMM\n" +
//         "MMMMMh   .mMMMMMMMMMMMMMMMMMMMMMMMMMMMMmoooodMMMMM\n" +
//         "MMMMMMNhsmMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmdmNMMMMMM\n" +
//         "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM\n"
// }

module.exports = () => {
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Starting ${chalk.magentaBright(`Aurora v${pkg.version}`)}\n`);
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`${chalk.gray(`</> Made by ZYROUGE | https://github.com/zyrouge`)}\n`);
    process.stdout.write(`${chalk.gray(`[@] Source Code: https://github.com/zyrouge/aurora-bot`)}\n`);
    process.stdout.write(`${String.fromCharCode(160)}\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Environment - ${chalk.cyanBright(`${process.env.NODE_ENV || "unknown"}`)}\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Building bot...\n`);
}