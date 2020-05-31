/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const pkg = require("../../package.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const settingsFile = fs.readFileSync(path.resolve("options.yaml"), 'utf8');
const settings = yaml.parse(settingsFile);
const exec = require('child_process').execSync;

const remote = settings.remote || "origin";
const availableBranches = ["master", "dev"];
const branch = settings.branch && availableBranches.includes(settings.branch.toLowerCase) ? settings.branch : "master";

module.exports.check = () => new Promise(async (resolve, reject) => {
    try {
        if(settings.update && settings.update.includeFixes) {
            await this.fetch(); /* Fetches branch to determine commit IDs */
            await this.reset(); /* Cleans the changes */

            /* Commits */
            const currentCommit = exec(`git rev-parse ${branch}`);
            const latestCommit = exec(`git rev-parse ${remote}/${branch}`);
console.log(currentCommit, latestCommit)
            resolve({
                same: currentCommit === latestCommit,
                current: currentCommit,
                latest: latestCommit
            });
        } else {
            const response = await axios.get(`https://raw.githubusercontent.com/zyrouge/aurora-bot/${branch}/package.json`);
            if(!response || !response.data) throw new Error("Could fetch the GitHub repo.");
            
            resolve({
                same: pkg.version === response.data.version,
                current: pkg.version,
                latest: response.data.version
            });
        }

    } catch (error) {
        reject(`Couldn\'t check versions. (${error})`);
    }
});

module.exports.update = () => new Promise(async (resolve, reject) => {
    try {
        await this.fetch();
        await this.reset();
        await this.pull();
        resolve(true);
    } catch (error) {
        reject(error);
    }
});

module.exports.fetch = () => new Promise((resolve, reject) => {
    try {
        exec(`git fetch ${remote} ${branch}`);
        resolve(true);
    } catch(error) {
        reject(`Something went wrong. ${stderr}`);
    }
});

module.exports.reset = () => new Promise(async (resolve, reject) => {
    try {
        exec(`git reset --hard ${remote}/${branch}`);
        resolve(true);
    } catch(error) {
        reject(`Something went wrong. ${stderr}`);
    }
});

module.exports.pull = () => new Promise(async (resolve, reject) => {
    try {
        exec(`git pull --force ${remote} ${branch}`);
        resolve(true);
    } catch(error) {
        reject(`Something went wrong. ${stderr}`);
    }
});
