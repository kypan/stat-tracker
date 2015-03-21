'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    config = require('./config');

module.exports = function(app, passport, db, io) {
    app.set('showStackError', true);

    // Prettify HTML
    app.locals.pretty = true;

    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        // Levels are specified in a range of 0 to 9, where-as 0 is
        // no compression and 9 is best compression, but slowest
        level: 9
    }));

    // Only use logger for development environment
    if (process.env.NODE_ENV === 'development') {
        app.use(express.logger('dev'));
    }

    // Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    // Enable jsonp
    app.enable("jsonp callback");

    app.configure(function() {

        //redirect to HTTPs for production
        if(process.env.NODE_ENV === 'production') {
            app.use(function(req, res, next) {
                if(req.headers['x-forwarded-proto']!=='https')
                    res.redirect('https://app.vesselsci.com'+req.url);
                else
                    next();
            });
        }

        // The cookieParser should be above session
        var cookieParser = express.cookieParser();
        app.use(cookieParser);
        //CORS middleware
        var allowCrossDomain = function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            if ('OPTIONS' === req.method) {
                return res.send(200);
            }
            next();
        };


        // Request body parsing middleware should be above methodOverride
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());

        // Express/Mongo Session Storage
        var sessionStore = new mongoStore({
                db: db.connection.db,
                collection: config.sessionCollection
            });

        app.use(express.session({
            secret: config.sessionSecret,
            store: sessionStore,
            cookie: config.sessionCookie,
            name: config.sessionName,
            resave: true,
            saveUninitialized: true
        }));

        // Connect flash for flash messages
        app.use(flash());

        // Dynamic helpers
        app.use(helpers(config.app.name));

        // Use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(allowCrossDomain);
        // Routes should be at the last
        app.use(app.router);

        // Setting the fav icon and static folder
        app.use(express.favicon());
        app.use(express.static(config.root + '/public'));

        // Assume "not found" in the error msgs is a 404. this is somewhat
        // silly, but valid, you can do whatever you like, set properties,
        // use instanceof etc.
        app.use(function(err, req, res, next) {
            // Treat as 404
            if (~err.message.indexOf('not found')) return next();

            // Log it
            console.error(err.stack);

            // Error page
            res.status(500).send('Uh Oh, Something something failed. Try Again.');
        });

        // Assume 404 since no middleware responded
        app.use(function(req, res, next) {
            res.status(404).render('Uh Oh, We could not find what you were looking for');
        });

        //setup sockets
        var SessionSockets = require('./session.socket.io.js'),
            sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

        sessionSockets.on('connection', function(err, socket, session){
            //using socket.io room to group multiple windows of same user session together
            if(session && session.passport){
                socket.join('user:'+session.passport.user);
            }

            socket.on('register_object', function(id) {
                socket.join('object:'+id);
            });

            socket.on('deregister_object', function(id) {
                socket.leave('object:'+id);
            })
        });

    });
};