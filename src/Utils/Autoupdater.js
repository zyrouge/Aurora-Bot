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
const util = require('util');
const { stderr } = require("process");
const Exec = require('child_process').exec;
const exec = util.promisify(Exec);

const remote = settings.remote || "origin";
const availableBranches = ["master", "dev"];
const branch = settings.branch && availableBranches.includes(settings.branch.toLowerCase) ? settings.branch : "master";

module.exports.check = () => new Promise(async (resolve, reject) => {
    try {
        let response;
        if(settings.update && settings.update.includeFixes) {
            await this.fetch(); /* Fetches branch to determine commit IDs */
            await this.reset(); /* Cleans the changes */

            /* Current Commit */
            const currentCommit = await exec(`git rev-parse ${branch}`);
            if(currentCommit.stderr) return reject(`Something went wrong while fetching current commit ID. ${currentCommit.stderr}`);

            /* Latest Commit */
            const latestCommit = await exec(`git rev-parse ${remote}/${branch}`);
            if(latestCommit.stderr) return reject(`Something went wrong while fetching current commit ID. ${latestCommit.stderr}`);

            resolve({
                same: currentCommit.stdout === latestCommit.stdout,
                current: currentCommit.stdout,
                latest: latestCommit.stdout
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

module.exports.fetch = () => new Promise(async (resolve, reject) => {
    Exec(`git fetch ${remote} ${branch}`, (stderr) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(true);
    });
});

module.exports.reset = () => new Promise(async (resolve, reject) => {
    const { stderr } = await exec(`git reset --hard ${remote}/${branch}`);
    if(stderr) return reject(`Something went wrong. ${stderr}`);
    resolve(true);
});

module.exports.pull = () => new Promise(async (resolve, reject) => {
    let command = `git pull ${remote} ${branch}`;
    if(settings.update.forceUpdate) command += " --force";
    const { stderr } = await exec(command);
    if(stderr) return reject(`Something went wrong. ${stderr}`);
    resolve(true);
});
