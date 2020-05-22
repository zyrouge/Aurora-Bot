/** 
 * @author ZYROUGE
 * @license MIT
*/

const router = require('express').Router();

router.get(`/`, (req, res) => {
    res.json(req.client.guilds.map(x => JSON.parse(`{ "name": "${x.name}", "id": "${x.name}" }`)));
});

router.get(`/:userID`, (req, res) => {
    const user = req.client.users.get(req.params.userID);
    if(user) {
        return res.json(user);
    }
    return res.send(`Not found.`);
});

const authenticate = (req, res, next) => {
    const user = req.client.users.get(req.params.userID);
    if(user) return next();
    else return res.send(`Not found.`);
};

router.get(`/:userID/data`, authenticate, (req, res) => {
    const userID = req.params.userID;
    req.client.database.User.findOne({ where: { userID } })
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

router.post(`/:userID/data`, authenticate,  (req, res) => {
    const userID = req.params.userID;
    req.client.database.User.create(req.body)
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

router.patch(`/:userID/data`, authenticate,  (req, res) => {
    const userID = req.params.userID;
    req.client.database.User.update(req.body, { where: { userID } })
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

router.delete(`/:userID/data`, authenticate,  (req, res) => {
    const userID = req.params.userID;
    req.client.database.User.destroy({ where: { userID } })
    .then(data => res.json(data))
    .catch(e => res.send(e));
});

module.exports = router;