/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

/* Prerequisites */
global.startTime = Date.now();
require('dotenv').config();
require('./Utils/Starter')();

let Aurora;
try {
    Aurora = require("aurora");
} catch(e) {
    Aurora = require("../Aurora");
}

global.Aurora = Aurora;

/* Aurora */
const client = new Aurora.Client(require(`../config`).token, {
    firstShardID: 0,
    maxShards: "auto",
    messageLimit: 0,
    defaultImageFormat: "png",
    defaultImageSize: 1024,
    disableEvents: [
        "TYPING_START"
    ]
});

/* Initialize */
const init = async () => {
    /* Updater */
    await require('./Utils/Starter').update();

    const chalk = require('chalk');
    const fs = require('fs');
    const path = require('path');

    /* Redefine Console + Prototypes*/
    require("./Utils/Console")();
    require("./Utils/Prototypes")();

    /* Commands */
    fs.readdir(path.resolve(`src`, `commands`), (error, categories) => {
        if(error) console.error(error);
        client.categories = categories;
        categories.forEach(category => {
            let LOADED = 0, SKIPPED = 0;
            fs.readdir(path.resolve(`src`, `commands`, `${category}`), (error, commandFiles) => {
                if(error) console.error(error);
                commandFiles.forEach(async commandFile => {
                    const _dir = path.resolve(`src`, `commands`, `${category}`, `${commandFile}`);
                    const statFile = fs.lstatSync(_dir);
                    const hasSub = statFile.isDirectory();
                    const dir = hasSub ? path.resolve(`src`, `commands`, `${category}`, `${commandFile}`, "index.js") : _dir;
                    const command = new (require(dir))(client);
                    if(command.conf.enabled) {
                        command.conf.dir = dir;
                        command.conf._dir = hasSub ? _dir : dir;
                        command.conf.hasSub = hasSub;
                        command.conf.category = category.toProperCase();
                        command.conf.createdAt = statFile.birthtime;
                        client.commands.set(command.conf.name, command);
                        command.conf.aliases.forEach(alias => client.aliases.set(alias, command.conf.name));
                        if(hasSub) await command.setup();
                        LOADED += 1;
                    } else SKIPPED += 1;
                });
                console.log(`Loaded ${chalk.blueBright(`${LOADED}`)} Command(s) in ${chalk.blueBright(`${category.toProperCase()}`)}`);
                if(SKIPPED) console.warn(`Skipped ${chalk.yellow(`${SKIPPED}`)} Command(s) in ${chalk.blueBright(`${category.toProperCase()}`)}`);
            });
        });
    });

    /* Events */
    fs.readdir(path.resolve(`src`, `events`), (error, files) => {
        if(error) console.error(error);
        files.forEach(eventFile => {
            const event = new (require(path.resolve(`src`, `events`, `${eventFile}`)))(client);
            const eventName = eventFile.split(".")[0];
            client.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(path.resolve(`src`, `events`, `${eventFile}`))];
        });
        console.log(`Loaded ${chalk.blueBright(`${files.length}`)} Event(s)`);
    });

    /* Database */
    await client.database.Guild.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Guild`)} (Database)`));
    await client.database.Member.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Member`)} (Database)`));
    await client.database.ModCase.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`ModCase`)} (Database)`));
    await client.database.ReactionRole.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`ReactionRole`)} (Database)`));
    await client.database.Role.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Role`)} (Database)`));
    await client.database.Settings.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Settings`)} (Database)`));
    await client.database.TextChannel.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`TextChannel`)} (Database)`));
    await client.database.User.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`User`)} (Database)`));
    
    /* Login */
    process.stdout.write(`[${chalk.redBright("BOOT")}] Build Completed!\n`);
    process.stdout.write(`[${chalk.redBright("BOOT")}] Connecting to Discord API...\n`);
    await client.connect()
    .catch(e => {
        process.stdout.write(`[${chalk.redBright("BOOT")}] Booting failed!`);
        console.error(e);
        process.stdout.write(`[${chalk.redBright("BOOT")}] Exiting...`);
        process.exit(0);
    });

    /* API */
    await client.web().then((port) => process.stdout.write(`[${chalk.redBright("BOOT")}] Website listening on PORT ${port}!\n`));
};

init();

if(process.env.NODE_ENV === "production") {
    process.on("unhandledRejection", (error) => {
        const chalk = require('chalk');
        console.error(chalk.redBright(`[ ERROR (START) ]`));
        console.error(error);
        console.error(chalk.redBright(`[ ERROR (END) ]`));
    });
}