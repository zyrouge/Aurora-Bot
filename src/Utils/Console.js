module.exports  = () => {
    const fs = require("fs");
    const path = require("path");
    var moment = require("moment");
    require("moment-timezone");

    const date = moment().tz('Asia/Kolkata').format(`YYYY-MM-DD`);
    const time = moment().tz('Asia/Kolkata').format(`HH:mm:ss zz`);

    /* Normal */
    const normalPath = `/app/logs/normal/${date}.log`;
    fs.closeSync(fs.openSync(normalPath, 'a'));
    const normalFile = fs.createWriteStream(normalPath, { flags: 'a' });

    const consoleLog = console.log;
    console.log = function(log) {
        consoleLog(`[${date} ${time}] ${log}`);
        normalFile.write(`[${time}] ${log}\n`);
    }

    /* Error */
    const errorPath = `/app/logs/error/${date}.log`;
    fs.closeSync(fs.openSync(errorPath, 'a'));
    const errorFile = fs.createWriteStream(errorPath, { flags: 'a' });

    const consoleError = console.error;
    console.error = function(log) {
        consoleError(`[${date} ${time}] ${log}`);
        errorFile.write(`[${time}] ${log}\n`);
    }
}