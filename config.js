/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const config = {
    id: process.env.CLIENTID,
    secret: process.env.CLIENTSECRET,
    redirect: process.env.REDIRECT,
    state: process.env.NODE_ENV || "unknown",
    prod: process.env.NODE_ENV === "production",
    token: process.env.DISCORDTOKEN,
    prefix: process.env.NODE_ENV === "production" ? "a&" : "a$",
    invite: `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENTID}&permissions=2146827775&response_type=code&scope=bot`,
    oauth: `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENTID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT)}&response_type=code&scope=guilds%20identify`,
    support: "https://discord.com/invite/8KV5zCg",
    dashboard: "https://auroradiscordbot.ga",
    website: "https://auroradiscordbot.ga",
    port: 3000,

    owners: ["521007613475946496"],
    developers: ["480933736276426763"],
    admins: [],
    helpers: [],
    get staffs() { return ([...this.owners, ...this.developers]); }
};

module.exports = config;