/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;
const helmet = require('helmet');
const path = require("path");
const config = require(path.resolve("config"));

const web = async ({
    client
}) => {
    
    const server  = express();

    server.use(helmet());
    server.disable('x-powered-by');

    server.use(bodyParser.json());
    server.set('view engine', 'ejs');
    server.set('views', path.join(__dirname, "pages"));

    const MemoryStore = require('memorystore')(session);
    server.use(session({
        store: new MemoryStore({
            checkPeriod: 86400000
        }),
        secret: 'AuroraDiscordBot',
        resave: false,
        saveUninitialized: false
    }));

    server.use((req, res, next) => {
        req.aurora = client;
        next();
    });

    await bindPassport(server);
    await bindAuth(server);

    server.use('/static', express.static(path.join(__dirname, "static")));
    server.get('/ping', (req, res) =>  res.status(200).json({ ok: true }));
    server.use('/', require("./routes/Main"));
    server.get('/dash', checkAuth, (req, res) =>  res.send('dde'));

    /* 404 */
    server.use((req, res) => {
        res.status(404).send('404: Page not Found');
    });

    server.listen(client.config.port);
    
    Promise.resolve();

};

module.exports = web;

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

module.exports.checkAuth = checkAuth;

async function bindPassport(server) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    
    passport.use(new Strategy({
        clientID: config.id,
        clientSecret: config.secret,
        callbackURL: config.redirect,
        scope: [ 'identify', 'guilds' ]
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    server.use(passport.initialize());
    server.use(passport.session());

    Promise.resolve();

}

async function bindAuth(server) {

    server.get('/login', (req, res) => {
        res.redirect(config.oauth);
    });

    server.get('/auth/callback',
        passport.authenticate('discord', {
            failureRedirect: '/'
        }), (req, res) => res.redirect('/')
    );

    server.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    Promise.resolve();
    
}