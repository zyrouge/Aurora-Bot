/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "editsnipe",
            description: "Shows the last edited Message in the Channel.",
            usage: "[channel]",
            guildOnly: true,
            aliases: ["editedmsg"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true,
            cooldown: 10
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            const key = {
                channelID: `${message.channel.id}`,
                guildID: `${message.channel.guild.id}`
            };
            let ChannelDB = await this.client.database.TextChannel.findOne({ where: key });
            if(
                !ChannelDB ||
                !ChannelDB.dataValues ||
                !ChannelDB.dataValues.lastDeleted ||
                !ChannelDB.dataValues.lastDeleted.content ||
                !ChannelDB.dataValues.lastDeleted.oldContent ||
                !ChannelDB.dataValues.lastDeleted.authorID
            ) return responder.send({
                embed: this.client.embeds.embed(message.author, {
                    description: `${this.client.emojis.cross} Nothing was found.`
                })
            });
            const user = await this.client.fetchUser(ChannelDB.dataValues.lastDeleted.authorID);
            if(!user) {
                return responder.send({
                    embed: this.client.embeds.embed(null, {
                        description: `${this.client.emojis.cross} Nothing was found.`
                    })
                });
            }
            const embed = this.client.embeds.embed(null, {
                fields: [
                    {
                        name: `Before`,
                        value: `${ChannelDB.dataValues.lastDeleted.oldContent.shorten(997)}`
                    },
                    {
                        name: `After`,
                        value: `${ChannelDB.dataValues.lastDeleted.content.shorten(997)}`
                    }
                ]
            });
            embed.author = {};
            embed.author.name = `${user.username}#${user.discriminator}`;
            embed.author.icon_url = user.avatar ?
                            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}` :
                            `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 4}.png`;
            responder.send({ embed });
        } catch (e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }
}

module.exports = _Command;