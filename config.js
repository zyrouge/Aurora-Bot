/** 
 * @author ZYROUGE
 * @license MIT
*/

const state = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

const config = {
    state,
    token: state == "production" ? process.env.DISCORDTOKEN : process.env.TOKEN,
    prefix: `a&`,
    invite: `https://discord.com/oauth2/authorize?client_id=702808552892530829&permissions=2146827775&redirect_uri=https%3A%2F%2Fauroradiscordbot.ga%2Fcallback&response_type=code&scope=guilds%20bot%20identify`,
    support: "https://discord.com/invite/8KV5zCg",
    dashboard: "https://auroradiscordbot.ga",
    admin: [],
    owner: [ "521007613475946496" ],
    port: 3000
};

module.exports = config;