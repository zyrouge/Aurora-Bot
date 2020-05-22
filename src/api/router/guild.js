/** 
 * @author ZYROUGE
 * @license MIT
*/

const router = require('express').Router();

router.get(`/`, (req, res) => {
    res.json(req.client.guilds.map(x => JSON.parse(`{ "name": "${x.name}", "id": "${x.name}" }`)));
});

router.get(`/:guildID/info`, (req, res) => {
    const guild = req.client.guilds.get(req.params.guildID);
    if(guild) {
        return res.json(guild);
    }
    return res.send(`Not found.`);
});

const authenticate = (req, res, next) => {
    const guild = req.client.guilds.get(req.params.guildID);
    if(guild) return next();
    else return res.send(`Not found.`);
};

router.get(`/:guildID/data`, authenticate, async (req, res) => {
    try {
        const guildID = req.params.guildID;
        let guildDB = await req.client.database.Guild.findOne({ where: { guildID } });
        if(!guildDB) guildDB = await req.client.database.Guild.create({ guildID });
        res.status(200).json(guildDB);
    } catch(e) {
        res.status(500).send(`${e}`);
    }
});

router.post(`/:guildID/data`, authenticate,  (req, res) => {
    const guildID = req.params.guildID;
    req.client.database.Guild.create(req.body)
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

router.patch(`/:guildID/data`, authenticate,  (req, res) => {
    const guildID = req.params.guildID;
    req.client.database.Guild.update(req.body, { where: { guildID } })
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

router.delete(`/:guildID/data`, authenticate,  (req, res) => {
    const guildID = req.params.guildID;
    req.client.database.Guild.destroy({ where: { guildID } })
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

module.exports = router;