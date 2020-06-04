const express = require("express");
const path = require("path");
const router = express.Router();
const axios = require("axios");
const moment = require("moment");
const config = require(path.resolve("config"));

router.get("/", (req, res) => {
    res.render('Home.ejs', {
        aurora: req.aurora
    });
});

router.get("/commands", (req, res) => {
    res.render('Commands.ejs', {
        aurora: req.aurora
    });
});

router.get("/status", async (req, res) => {
    try {
        /* Incidents */
        const moment = require("moment");
        const marked = require("marked");
        const incidents = [];
        const incidentsGuild = req.aurora.guilds.get('587042898546262043') || false;
        const incidentsChannel = incidentsGuild ? incidentsGuild.channels.get('710864902054477857') : false;
        const incidentsMessages = incidentsChannel ? await incidentsChannel.getMessages(20) : false;
        if(incidentsMessages && incidentsMessages.length) {
            incidentsMessages.forEach(incident => {
                incidents.push({
                    author: {
                        name: incident.author.username,
                        discrim: incident.author.discriminator,
                        avatar: `https://cdn.discordapp.com/avatars/${incident.author.id}/${incident.author.avatar}.png?size=512`
                    },
                    content: marked(incident.content),
                    time: moment(incident.timestamp).format('DD/MM HH:mm')
                });
            });
        }

        /* Bot Chart */
        const botChartKey = "m784892050-8d5441d21dd9f5405211e7cc";
        const botChartResp = await axios.post(
            "https://api.uptimerobot.com/v2/getMonitors",
            `api_key=${botChartKey}&format=json&response_times=1`, {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            }
        }).catch(() => {});

        let chart = null;
        if(botChartResp && botChartResp.data && botChartResp.data.monitors && botChartResp.data.monitors[0]) {
            const monitor = botChartResp.data.monitors[0];
            chart = {
                status: null,
                data: [],
                label: []
            };
            switch (monitor.status) {
                case 8: chart.status = "__disrupted__"; break;
                case 9: chart.status = "__down__"; break;
                default: chart.status = "__up__";
            }
            const monitors = monitor.response_times
                .sort((a, b) => b.datetime - a.datetime)
                .filter((m, index) => index < 20)
                .reverse();
            for (let i = 0; i < monitors.length; i++) {
                let current = monitors[i];
                let x = moment.unix(current.datetime).format("HH:mm");
                let y = parseInt(current.value);
                chart.label.push(`${x}`);
                chart.data.push(y);
            }
        }

        res.render('Status.ejs', {
            aurora: req.aurora,
            chart, incidents
        });
    } catch(e) {
        res.render('500.ejs');
    } 
});

router.get("/invite", (req, res) => {
    let url = config.invite;
    if(req.query.guild_id) url += `&guild_id=${req.query.guild_id}`;
    res.redirect(url);
});

module.exports = router;