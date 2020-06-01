/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const web = async ({
    client
}) => {
    
    const server  = express();

    server.use(bodyParser.json());
    server.set('view engine', 'ejs');
    server.set('views', path.join(__dirname, "pages"));

    server.use((req, res, next) => {
        req.aurora = client;
        next();
    });

    server.use('/static', express.static(path.join(__dirname, "static")));
    server.use('/', require("./routes/Main"));

    /* 404 */
    server.use(function(req, res) {
        res.status(404);
        res.send('404: Page not Found');
    });

    server.listen(client.config.port);
    
    Promise.resolve();

};

module.exports = web;
