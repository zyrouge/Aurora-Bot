/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const config = {
    state: process.env.NODE_ENV || "unknown",
    prod: process.env.NODE_ENV === "production",
    token: process.env.DISCORDTOKEN,
    prefix: this.prod ? "a&" : "a$",
    invite: `https://discord.com/oauth2/authorize?client_id=702808552892530829&permissions=2146827775&response_type=code&scope=bot`,
    support: "https://discord.com/invite/8KV5zCg",
    dashboard: "https://auroradiscordbot.ga",
    website: "https://auroradiscordbot.ga",
    admin: [],
    owner: [ "521007613475946496" ],
    port: 3000
};

module.exports = config;