const time = () => new Date().toLocaleTimeString();

class Logger {
    static info(text) {
        console.log(`[${time()} INFO] ${text}`);
    }

    static warn(text) {
        console.log(`[${time()} WARN] ${text}`);
    }

    static error(text) {
        console.log(`[${time()} ERR!] ${text}`);
    }
}

module.exports = Logger;
