#!/usr/bin/env node

const pkg = require("../package.json");
const fs = require("fs-extra");
const path = require("path");
const { default: SimpleGit } = require("simple-git");
const { Command } = require("commander");
const chalk = require("chalk");
const symbols = require("log-symbols");
const spinner = require("ora");
const { prompt } = require("inquirer");
const cp = require("child_process");
const util = require("util");

const info = (text) => console.log(`${symbols.info} ${text}`);
const warn = (text) => console.log(`${symbols.warning} ${text}`);
const success = (text) => console.log(`${symbols.success} ${text}`);
const error = (text) => console.log(`${symbols.error} ${text}`);
const exec = (text) => new Promise(async (resolve, reject) => {
    const prom_exec = util.promisify(cp.exec);
    const { stdout, stderr } = await prom_exec(text);
    resolve(stdout);
    reject(stderr);
});

const commands = {
    pkgmanagers: {
        npm: {
            install: "npm install",
            start: "npm start"
        },
        yarn: {
            install: "yarn add",
            start: "yarn start"
        }
    }
}

const basedir = path.resolve();
const repourl = pkg.repository.url.replace("git+", "");
const codebranch = "code";
const program = new Command();
const exit = process.exit;

program.name(pkg.name)
    .version(pkg.version);

program
    .command("create")
    .aliases(["init", "initizalize", "generate", "gen"])
    .action(async () => {
        const { setupfolder, pkgmanager } = await prompt([
            {
                type: "input",
                message: "Where do you want to setup your project?",
                name: "setupfolder",
                default: "./bot"
            },
            {
                type: "list",
                message: "Which package manager do you prefer?",
                name: "pkgmanager",
                choices: ["npm", "yarn"]
            }
        ]);
        console.log("\n");

        const folder = path.join(basedir, setupfolder);
        info(`Generating project in ${chalk.grey(folder)}`);

        await fs.ensureDir(folder)
            .catch((err) => {
                error(`Could not ensure directory: ${chalk.grey(folder)}`);
                if (err) error(chalk.red(err));
                exit();
            });

        const gitInitLog = spinner(`Setting up project in ${chalk.grey(folder)}`).start();
        const git = SimpleGit(folder)

        await git.clone(repourl, folder)
            .catch((err) => {
                gitInitLog.fail(`Could not initiate git in ${chalk.grey(folder)}`);
                if (err) error(chalk.red(err));
                exit();
            });
        gitInitLog.succeed(`Repository cloned in ${chalk.grey(folder)}`);

        const gitCheckoutLog = spinner(`Checking out to branch ${chalk.cyanBright(codebranch)}`).start();
        await git.checkoutBranch(codebranch)
            .catch((err) => {
                gitInitLog.fail(`Could not checkout to branch ${chalk.cyanBright(codebranch)} in ${chalk.gray(folder)}`);
                if (err) error(chalk.red(err));
                exit();
            });
        gitCheckoutLog.succeed(`Checked out to branch ${chalk.cyanBright(codebranch)}`);

        const depInstallLog = spinner(`Installing dependencies`).start();
        await exec(`cd ${folder} && ${commands.pkgmanagers[pkgmanager].install}`)
            .then(() => depInstallLog.succeed(`Installed all the necessary dependencies`))
            .catch(err => {
                gitInitLog.fail(`Could not install dependencies in ${chalk.cyanBright(folder)}. Run ${chalk.cyanBright(commands.pkgmanagers[pkgmanager].install)} in the project folder to install them`);
                if (err) error(chalk.red(err));
            });

        success(`Project has been setup successfully in ${chalk.grey(folder)}!`);

        console.log("\n");

        [
            `Run ${chalk.cyanBright(`cd ${setupfolder}`)} to get into the project folder`,
            `Run ${chalk.cyanBright(commands.pkgmanagers[pkgmanager].start)} to start the bot`
        ].forEach(info);
    });

program
    .command("update")
    .action(async () => {
        const isNPM = fs.existsSync(path.join(basedir, "package-lock.json")) ? "npm" : undefined;
        const isYarn = fs.existsSync(path.join(basedir, "yarn.lock")) ? "yarn" : undefined;

        const questions = [
            {
                type: "confirm",
                message: `Do you want to update the project in ${chalk.gray(basedir)}?`,
                name: "continueToUpdate"
            }
        ];
        if (!isNPM && !isYarn) questions.push({
            type: "list",
            message: "Which package manager do you prefer?",
            name: "rpkgmanager",
            choices: ["npm", "yarn"]
        });

        const { continueToUpdate, rpkgmanager } = await prompt(questions);
        if (!continueToUpdate) exit();

        const pkgmanager = isNPM || isYarn || rpkgmanager;

        console.log("\n");

        const git = SimpleGit(basedir);

        const gitPullLog = spinner(`Pulling files from ${chalk.cyanBright(codebranch)}`).start();
        await git.pull(undefined, codebranch, ["--force"])
            .catch(err => {
                gitInitLog.fail(`Could not pull files from ${chalk.cyanBright(codebranch)}`);
                if (err) error(chalk.red(err));
            });
        gitPullLog.succeed(`New files has been added to ${chalk.gray(basedir)}`);

        const depInstallLog = spinner(`Installing dependencies`).start();
        await exec(commands.pkgmanagers[pkgmanager].install)
            .then(() => depInstallLog.succeed(`Installed all the necessary dependencies`))
            .catch(err => {
                gitInitLog.fail(`Could not install dependencies in ${chalk.cyanBright(basedir)}. Run ${chalk.cyanBright(commands.pkgmanagers[pkgmanager].install)} in the project folder to install them`);
                if (err) error(chalk.red(err));
            });

        success(`Project in ${chalk.grey(basedir)} has been updated successfully!`);

        console.log("\n");

        [
            `Run ${chalk.cyanBright(commands.pkgmanagers[pkgmanager].start)} to start the bot`
        ].forEach(info);
    })

program.parse(process.argv);