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
    exec("git pull origin master", (stderr, stdout) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(stdout && stdout.includes("Already up to date.") ? false : true);
    });
});