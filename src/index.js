/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

require('dotenv').config();
const Aurora = require(`./base/Client`);
const client = new Aurora(require(`../config`).token, {
    firstShardID: 0,
    maxShards: "auto",
    messageLimit: 0,
    defaultImageFormat: "png",
    defaultImageSize: 1024,
    disableEvents: [
        "TYPING_START",
    ]
});

/* Initialize */
const init = async () => {
    const chalk = require('chalk');
    const fs = require('fs');
    const path = require('path');

    console.log(`${String.fromCharCode(160)}`);
    console.log(chalk.magentaBright(client.utils.ascii.Aurora));
    console.log(`${String.fromCharCode(160)}`);
    console.log(`Made by ZYROUGE | https://github.com/zyrouge`);
    console.log(`Source Code: https://github.com/zyrouge/aurora-bot`);
    console.log(`${String.fromCharCode(160)}`);
    console.log(`Starting Aurora...`);

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

    /* Login */
    client.connect()
    .then(() => {
        /* API */
        client.api().then((port) => console.log(`Started ${chalk.greenBright(`API`)} (Port ${port})`));
        /* Database */
        client.database.Guild.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Guild`)} (Database)`));
        client.database.Member.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Member`)} (Database)`));
        client.database.ModCase.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`ModCase`)} (Database)`));
        client.database.ReactionRole.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`ReactionRole`)} (Database)`));
        client.database.Role.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Role`)} (Database)`));
        client.database.Settings.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`Settings`)} (Database)`));
        client.database.TextChannel.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`TextChannel`)} (Database)`));
        client.database.User.sync({force:true}).then(() => console.log(`Loaded ${chalk.greenBright(`User`)} (Database)`));
    });
};

init();

process.on("unhandledRejection", (error) => {
    const chalk = require('chalk');
    console.log(chalk.redBright(`[ ERROR (START) ]`));
    console.log(error);
    console.log(chalk.gray(`Event: unhandledRejection`));
    console.log(chalk.gray(`Logged on: ${require("./Utils/getTime")()}`));
    console.log(chalk.redBright(`[ ERROR (END) ]`));
});