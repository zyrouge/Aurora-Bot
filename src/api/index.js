/** 
 * @author ZYROUGE
 * @license MIT
*/

const express = require("express");
var bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const config = require(path.resolve("config"));
const moment = require("moment");
require("moment-duration-format");

module.exports.start = async client => {
  const server = express();

  /* CORS all */
  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  server.get(`/ping`, (req, res) => res.status("200").send(`Pong!`));
  server.get(`/status`, (req, res) => {
    if(!client) return res.status(500).send(`Internal Server Error.`);
    const shards = new Array();
    client.shards.forEach(shard => {
      shards.push({
        status: shard.status,
        ping: shard.latency,
        isReady: shard.ready,
        id: shard.id
      });
    });
    res.status(200).json({
      shards,
      uptime: client.uptime,
      servers: client.guilds.size,
      users: client.users.size,
      os: process.platform,
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    });
  });

  server.get(`/commands`, async (req, res) => {
    const cmds = [];
    client.commands.forEach(cmd => {
      const conf = cmd.conf;
      const commands = cmd.commands.map(c => c.conf);
      cmds.push({ conf, commands });
    });
    res.json(cmds);
  });

  server.use(`/dashboardchart`, (req, res) => {
    const key = "m784804799-e0f8c9482c801f8c37e0c3d7";
    axios
      .post(
        "https://api.uptimerobot.com/v2/getMonitors",
        `api_key=${key}&format=json&response_times=1`,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          }
        }
      )
      .then(resp => {
        res.json(resp.data);
      });
  });

  server.use(`/botchart`, (req, res) => {
    const key = "m784892050-8d5441d21dd9f5405211e7cc";
    axios
      .post(
        "https://api.uptimerobot.com/v2/getMonitors",
        `api_key=${key}&format=json&response_times=1`,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          }
        }
      )
      .then(resp => {
        res.json(resp.data);
      });
  });
  
  server.get(`/statuschannel`, async (req, res) => {
    const messages = await client.guilds.get('587042898546262043').channels.get('710864902054477857').getMessages(20);
    const filtered = new Array();
    messages.forEach(msg => {
      filtered.push({
        content: msg.content,
        author: msg.author,
        unparsedTimestamp: msg.timestamp
      });
    });
    res.json(filtered);
  });

  /* Real Stuffs */
  server.use(bodyParser.json());
  
  server.use((req, res, next) => {
    if(!client) return res.status(500).send(`Internal Server Error.`);
    req.client = client;
    next();
  });
  
  server.use((req, res, next) => {
    /* Step 1 */
    const authorization = req.headers["authorization"];
    if (!authorization) {
      res.status(401).end(`Unauthorised`);
      return;
    }
    
    /* Step 2 */
    const password = req.headers["password"];
    const bypass = req.headers["bypass"];
    const cypher = req.headers["cypher"];
    const code = req.headers["code"];
    if (!password || !bypass || !cypher || !code) {
      res.status(401).end(`Unauthorised`);
      return;
    }
    
    /* Step 3 */
    if (password !== process.env.PASSWORD || bypass !== process.env.BYPASS || cypher !== process.env.CYPHER || code !== process.env.CODE) {
      res.status(401).end(`Unauthorised`);
      return;
    }
    
    /* Step 4 */
    axios
      .get(`https://discordapp.com/api/users/@me`, {
        headers: {
          authorization
        }
      })
      .then(resp => {
        if (resp.status !== 200) {
          res.status(401).end(`Invalid Token`);
          return;
        } else next();
      })
      .catch(e => {
        res.status(401).end(`${e}`);
        return;
      });
  });
  
  /* Lets go */
  server.use(`/client`, require(`./router/client`));
  server.use(`/guilds`, require(`./router/guild`));
  server.use(`/users`, require(`./router/user`));
  server.use(`/info`, require(`./router/user`));

  server.listen(client.config.port);
};
