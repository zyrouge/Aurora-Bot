/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Client, Collection } = require("eris-additions")(require("eris"));

class Aurora extends Client {
    constructor(token, options = {}) {
        if(!token || !options) throw new Error(`No Token was Found!`);
        super(token, options);
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = require(`../Utils/Cooldown`);
        this.categories = new Array();
        this.config = require(`../../config`);
        this.utils = require(`../Utils/Utils`);
        this.embeds = new (require(`../Utils/Embeds`))(this);
        this.responder = require(`../core/Responder/index.js`);
        this.translator = require(`../core/Translator/index.js`);
        this.emojis = require(`../Utils/Emojis`);
        this.database = require(`../database/index`);
        this.cache = require(`../Utils/Cache`);
    }

    async clean(text) {
        if (text && text.constructor.name == "Promise") text = await text;
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
        text = text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .replace(this.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
        return text;
    }

    shorten(str, max) {
        return ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
    }

    async parseMention(mention, check) {
        if (!mention) return false;
        const matches = mention.match(/^<@!?(\d+)>$/);
        if (matches) {
            const id = matches[1];
            return id;
        }
        if(!check) {
            const user = this.users.get(mention) || false;
            if(!isNaN(mention) && user) return mention;
        } else return !isNaN(mention) ? mention : false;
        return false;
    }

    async web() {
        return new Promise(async (resolve, reject) => {
            try {
                await require(`../web/index`)({ client: this });
                resolve(this.config.port);
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = Aurora;