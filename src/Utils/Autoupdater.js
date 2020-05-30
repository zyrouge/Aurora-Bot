const pkg = require("../../package.json");
const axios = require("axios");
const exec = require("child_process").exec;

module.exports.checkVersions = () => new Promise(async (resolve, reject) => {
    try {
        const response = await axios.get("https://raw.githubusercontent.com/zyrouge/aurora-bot/master/package.json");
        if(!response.data) throw new Error("Could fetch the GitHub repo.");
        resolve({ same: pkg.version === response.data.version, latest: response.data.version });
    } catch (error) {
        reject(`Couldn\'t check versions. (${error})`);
    }
});

module.exports.updateMaster = () => new Promise(async (resolve, reject) => {
    try {
        await this.fetchMaster();
        await this.resetMaster();
        await this.pullMaster();
        resolve(true);
    } catch (error) {
        reject(error);
    }
});

module.exports.fetchMaster = () => new Promise((resolve, reject) => {
    exec("git fetch origin master", (stderr, stdout) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(stdout && stdout.includes("Already up to date.") ? false : true);
    });
});

module.exports.resetMaster = () => new Promise((resolve, reject) => {
    exec("git reset --hard origin/master", (stderr, stdout) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(true);
    });
});

module.exports.pullMaster = (options = {}) => new Promise((resolve, reject) => {
    let command = "git pull origin master";
    if(options.force) command += " --force";
    exec(command, (stderr, stdout) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(true);
    });
});
