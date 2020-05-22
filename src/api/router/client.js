/** 
 * @author ZYROUGE
 * @license MIT
*/

const router = require('express').Router();

router.get(`/`, async(req, res) => {
    res.send(`Not found.`);
});

module.exports = router;