/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const router = require('express').Router();

router.get(`/`, async(req, res) => {
    res.send(`Not found.`);
});

module.exports = router;