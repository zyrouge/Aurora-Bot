/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command, CaseHandler } = global.Aurora;

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

    async run(message, args, { GuildDB, prefix, language, translator, responder, rawArgs }) {
        try {
            if(!args[0]) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("NO_PARAMETER_PROVIDED", "Case Number")
                    })
                });
            }

            if(isNaN(args[0])) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("INVALID_PARAMETER", "Case Number")
                    })
                });
            }

            if(!args[1]) {
                return responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("PROVIDE_SMTH_TO", "**Reason**", `edit the Case\'s Reason.`)
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
                    description: translator.translate("NO_SMTH_FOUND_WITH", "Case", `ID ${caseNum}`)
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
                        description: translator.translate("SUCCESS_SMTH_TASK", `**Case ${caseNum}**`, "updated")
                    })
                });
            })
            .catch(err => {
                responder.send({
                    embed: this.client.embeds.error(message.author, {
                        description: translator.translate("COULDNT_TASK", "update the Case", err)
                    })
                });
            });
        } catch(e) {        
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: translator.translate("SOMETHING_WRONG", e)
                })
            });
        }
    }

}

module.exports = _Command;