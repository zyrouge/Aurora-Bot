/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;
const path = require("path");
const config = require(path.resolve("config"));

const web = async ({
    client
}) => {
    
    const server  = express();

    server.use(bodyParser.json());
    server.set('view engine', 'ejs');
    server.set('views', path.join(__dirname, "pages"));

    server.use(session({
        secret: 'AuroraDiscordBot',
        resave: false,
        saveUninitialized: false
    }));

    server.use((req, res, next) => {
        req.aurora = client;
        next();
    });

    bindPassport(server);
    bindAuth(server);

    server.use('/static', express.static(path.join(__dirname, "static")));
    server.use('/', require("./routes/Main"));
    server.get('/dash', checkAuth, (req, res) =>  res.send('dde'))

    /* 404 */
    server.use(function(req, res) {
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

function bindPassport(server) {

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

}

function bindAuth(server) {

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
    
}