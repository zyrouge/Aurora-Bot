/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "case",
            description: "Ban a Member/User from Guild.",
            usage: "<case> [reason]",
            guildOnly: true,
            aliases: ["reason", "casereason"],
            permission: {
                bot: ["embedLinks"],
                user: ["manageMessages"]
            },
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            if(!args[0]) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Provide a **Case Number**.`
                    })
                });
            }

            if(isNaN(args[0])) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Provide a **Case Number**.`
                    })
                });
            }

            if(!args[1]) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Provide a **Reason** to edit the Case\'s Reason.`
                    })
                });
            }

            /* Check Case */
            const caseNum = parseInt(args[0]);
            const newReason = args.slice(1).join(" ");
            const key = {
                caseID: `${caseNum}`,
                guildID: message.channel.guild.id
            };
            const baseCase = await this.client.database.ModCase.findOne({ where: key });
            if(!baseCase || !baseCase.dataValues) return responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} No Case was found with **ID ${caseNum}**`
                })
            });
            let correctedCase = baseCase.dataValues;
            correctedCase.reason = newReason;
            if(correctedCase.channelID && correctedCase.messageID) {
                const caseChannel = message.channel.guild.channels.get(`${correctedCase.channelID}`);console.log(caseChannel)
                if(caseChannel) {
                    const caseMessage = await caseChannel.getMessage(`${correctedCase.messageID}`);console.log(caseMessage)
                    if(caseMessage && caseMessage.embeds && caseMessage.embeds[0] && caseMessage.embeds[0].description) {
                        let embed = caseMessage.embeds[0];
                        let description = embed.description.split("\n");
                        for(let i = 0; i < description.length; i++) {
                            if(description[i].startsWith("**Reason:**")) description[i] = `**Reason:** ${newReason}`;
                        };
                        embed.description = description.join("\n");
                        caseMessage.edit({ embed });
                    }
                }
            }
            this.client.database.ModCase.update(correctedCase, { where: key })
            .then(() => {
                responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.tick} **Case ${caseNum}** was updated successfully.`
                    })
                });
            })
            .catch(e => {
                responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: `${this.client.emojis.cross} Couldn\'t update the Case. **${e}**`
                    })
                });
            });
        } catch(e) {        
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }

}

module.exports = _Command;