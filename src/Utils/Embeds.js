/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const colors = require(`./colors`);

class embeds {
    constructor(client) {
        this.client = client;
    }

    embed(user, embed = {}) {
        if(user && user.id && user.avatarURL) {
            embed.author = {
                name: `${user.username}`,
                icon_url: `${user.avatarURL}`
            };
        };
        embed.color = colors.fuschia;
        embed.timestamp = new Date();
        embed.footer = {
            text: `${this.client.user.username}`,
            icon_url: `${this.client.user.avatarURL}`
        };
        return embed;
    }

    success(user, embed = {}) {
        const em = this.embed(user, embed);
        em.color = colors.green;
        return em;
    }

    error(user, embed = {}) {
        const em = this.embed(user, embed);
        em.color = colors.red;
        return em;
    }

    blurple(user, embed = {}) {
        const em = this.embed(user, embed);
        em.color = colors.blurple;
        return em;
    }

    plate(user, embed = {}) {
        embed.color = colors.fuschia;
        embed.timestamp = new Date();
        return embed;
    }

    fplate(user, embed = {}) {
        embed.color = colors.fuschia;
        embed.timestamp = new Date();
        embed.footer = {
            text: `${this.client.user.username}`,
            icon_url: `${this.client.user.avatarURL}`
        };
        return embed;
    }
}

module.exports = embeds;