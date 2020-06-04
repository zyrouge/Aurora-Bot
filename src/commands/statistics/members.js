/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const path = require('path');
const Command = require(path.resolve(`src`, `base`, `Command`));
const ChartJs = require('chart.js');
const { createCanvas } = require('canvas');
const moment = require('moment');

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "statistics",
            description: "Shows the Server Statistics.",
            usage: "",
            guildOnly: true,
            aliases: ["serverstats", "sstats"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            cooldown: 10,
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        try {
            var chartData = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Members Joined',
                            data: [],
                            backgroundColor: 'rgba(162, 57, 202, 0.2)',
                            borderColor: 'rgba(162, 57, 202, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Members Left',
                            data: [],
                            backgroundColor: 'rgba(71, 23, 246, 0.2)',
                            borderColor: 'rgba(71, 23, 246, 1)',
                            borderWidth: 1
                        }
                    ]
                }
            };

            let states = {};

            /* Joined */
            let members = message.channel.guild.members;
            members
            .filter(m => m.joinedAt)
            .sort((a, b) => a.joinedAt - b.joinedAt)
            .forEach(member => {
                const timeStamp = moment(member.joinedAt).format("D-M-YYYY");
                if(!states[timeStamp]) states[timeStamp] = {
                    joins: 0,
                    leaves: 0
                };
                states[timeStamp].joins += 1;
            });

            /* Leaves */
            const GuildDB = await this.client.database.Guild.findOne({ where: { guildID: message.channel.guild.id } });
            if(GuildDB && GuildDB.dataValues && GuildDB.dataValues.memberLeaveLogs && GuildDB.dataValues.memberLeaveLogs.length > 0) {
                GuildDB.dataValues.memberLeaveLogs
                .sort((a, b) => a.time - b.time)
                .forEach(log => {
                    const timeStamp = moment(log.time).format("D-M-YYYY");
                    if(!states[timeStamp]) states[timeStamp] = {
                        joins: 0,
                        leaves: 0
                    };
                    states[timeStamp].leaves += 1;
                });
            }

            /* Summing Up */
            Object.entries(states).forEach(([date, { joins, leaves }]) => {
                chartData.data.labels.push(date);
                chartData.data.datasets[0].data.push({
                    x: date,
                    y: (joins || 0)
                });
                chartData.data.datasets[1].data.push({
                    x: date,
                    y: (leaves || 0)
                });
            });

            if(chartData.data.labels.length < 3) {
                return responder.send({
                    embed: this.client.embeds.error(null, {
                        description: `${this.client.emojis.cross} No Statistics were Found.`
                    })
                })
            }

            /* Just do it */
            const statBuffer = await this.RenderChart(chartData);
            message.channel.createMessage({
                embed: this.client.embeds.embed(null, {
                    author: {
                        name: `${message.channel.guild.name} Statistics`,
                        icon_url: message.channel.guild.iconURL
                    },
                    description: `From **${chartData.data.labels[0]}** to **${chartData.data.labels[chartData.data.labels.length - 1]}**`,
                    image: { url: `attachment://statistics_${message.guild.id}.png` }
                })
            }, {
                file: statBuffer,
                name: `statistics_${message.guild.id}.png`
            });
        } catch(e) {
            responder.send({
                embed: this.client.embeds.error(message.author, {
                    description: `${this.client.emojis.cross} Something went wrong. **${e}**`
                })
            });
        }
    }

    async RenderChart(configuration) {
        const canvas = createCanvas(600, 300);
        configuration.options = configuration.options || {};
        configuration.options.responsive = false;
        configuration.options.animation = false;
        configuration.options.scales = {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
        };
        canvas.style = {};
        const context = canvas.getContext('2d');
        const chart = new ChartJs(context, configuration);
        return new Promise((resolve, reject) => {
            chart.canvas.toBuffer((error, buffer) => {
                if (error) {
                    return reject(error);
                }
                return resolve(buffer);
            });
        });
    }
}

module.exports = _Command;