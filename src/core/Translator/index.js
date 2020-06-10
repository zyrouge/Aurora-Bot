/** 
 * @author ZYROUGE, Snowflake107
 * @license GPL-3.0
*/

const path = require("path");
const LanguagesDir = path.join(__dirname, "Languages");

const Languages = {
    english: require(LanguagesDir + "/english.js"),
    nepali: require(LanguagesDir + "/nepali.js")
};

class Translator {
    constructor(language) {
        this.language = language && Languages[language] ? language : "english";
        this.translations = Languages[this.language];
    }
    
    translate(query, ...args) {
        let key = this.translations[query];
        if (!key) return this.translations["TRANSLATION_ERROR"];
        return (typeof key === "function") ? key(...args) : key;
    }
}

module.exports = Translator;