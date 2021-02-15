const fs = require('fs-extra');

for (const file of fs.readdirSync(__dirname)) {
    if (file !== 'index.js') {
        module.exports[file.split('.')[0]] = require(`./${file}`);
    }
}
