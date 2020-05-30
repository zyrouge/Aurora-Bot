const pkg = require("../../package.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const settingsFile = fs.readFileSync(path.resolve("options.yaml"), 'utf8');
const settings = yaml.parse(settingsFile);
const exec = require("child_process").exec;

const remote = settings.remote || "origin";
const availableBranches = ["master", "dev"];
const branch = settings.branch && availableBranches.includes(settings.branch.toLowerCase) ? settings.branch : "master";

module.exports.check = () => new Promise(async (resolve, reject) => {
    try {
        let response;
        if(settings.update && settings.update.includeFixes) {
            await this.fetch(); // Fetches branch to determine commit IDs
            exec(`git diff ${remote}/${branch} ${branch}`, (stderr,) => {
                if(stderr) return reject(`Something went wrong. ${stderr}`);

                let currentCommitID, latestCommitID;

                exec(`git rev-parse ${branch}`, (commitErr, commitID) => {
                    if(commitErr) return reject(`Something went wrong while fetching current commit ID. ${stderr}`);
                    currentCommitID = commitID;
                });

                exec(`git rev-parse ${remote}/${branch}`, (commitErr, commitID) => {
                    if(commitErr) return reject(`Something went wrong while fetching latest commit ID. ${stderr}`);
                    latestCommitID = commitID;
                });

                response = {
                    same: currentCommitID === latestCommitID,
                    current: currentCommitID,
                    latest: latestCommitID
                };
            });
        } else {
            const resp = await axios.get(`https://raw.githubusercontent.com/zyrouge/aurora-bot/${branch}/package.json`);
            if(!resp || !resp.data) throw new Error("Could fetch the GitHub repo.");
            
            response = {
                same: pkg.version === resp.data.version,
                current: pkg.version,
                latest: resp.data.version
            };
        }

        resolve(response);
    } catch (error) {
        reject(`Couldn\'t check versions. (${error})`);
    }
});

module.exports.update = () => new Promise(async (resolve, reject) => {
    try {
        await this.fetch();
        if(settings.update && settings.update.resetbeforeupdate) await this.reset();
        await this.pull();
        resolve(true);
    } catch (error) {
        reject(error);
    }
});

module.exports.fetch = () => new Promise((resolve, reject) => {
    exec(`git fetch ${remote} ${branch}`, (stderr, stdout) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(stdout && stdout.includes("Already up to date.") ? false : true);
    });
});

module.exports.reset = () => new Promise((resolve, reject) => {
    exec(`git reset --hard ${remote}/${branch}`, (stderr) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(true);
    });
});

module.exports.pull = () => new Promise((resolve, reject) => {
    let command = `git pull ${remote} ${branch}`;
    if(settings.update.forceUpdate) command += " --force";
    exec(command, (stderr) => {
        if(stderr) return reject(`Something went wrong. ${stderr}`);
        resolve(true);
    });
});
