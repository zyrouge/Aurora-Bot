/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = class {
    constructor(message) {
        this.raw = message;
        this._message = JSON.stringify(message);
    }

    user(user) {
        this._message = this._message
            .replace(new RegExp(`{{user}}`, "g"), `${user.mention}`)
            .replace(new RegExp(`{{user.username}}`, "g"), `${user.username}`)
            .replace(new RegExp(`{{user.discriminator}}`, "g"), `${user.discriminator}`)
            .replace(new RegExp(`{{user.tag}}`, "g"), `${user.username}#${user.discriminator}`)
            .replace(new RegExp(`{{user.id}}`, "g"), `${user.id}`);
        return this;
    }

    member(member) {
        this._message = this._message
            .replace(new RegExp(`{{member}}`, "g"), `${member.user.mention}`)
            .replace(new RegExp(`{{member.username}}`, "g"), `${member.user.username}`)
            .replace(new RegExp(`{{member.nickname}}`, "g"), `${member.nick ? member.nick : member.user.username}`)
            .replace(new RegExp(`{{member.discriminator}}`, "g"), `${member.user.discriminator}`)
            .replace(new RegExp(`{{member.tag}}`, "g"), `${member.user.username}#${member.user.discriminator}`)
            .replace(new RegExp(`{{member.id}}`, "g"), `${member.user.id}`);
        return this;
    }

    guild(guild) {
        this._message = this._message
            .replace(new RegExp(`{{guild}}`, "g"), `${guild.name}`)
            .replace(new RegExp(`{{guild.name}}`, "g"), `${guild.name}`)
            .replace(new RegExp(`{{guild.id}}`, "g"), `${guild.id}`);
        return this;
    }

    custom(from, to) {
        this._message = this._message.replace(new RegExp(from, "g"), to);
        return this;
    }

    finish() {
        return JSON.parse(this._message);
    }
}