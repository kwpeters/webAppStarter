#!/usr/bin/env node

var os        = require('os'),
    parseArgs = require('minimist');


/**
 * Prints usage information on the screen.
 */
function printUsage() {
    var lines;

    lines = [
        'Runs the server for the mftseed application.',
        'Usage:',
        '    node server.js --help',
        '    node server.js --port <portNum>',
        'where:',
        '    --help            Displays usage information',
        '    --port <portNum>  Sets the port the server will listen on'
    ];
    console.log(lines.join(os.EOL));
}


/**
 * Runs the server.
 * @param {number} portNum - The port number the server should listen on
 */
function runServer(portNum) {

    var express = require('express'),
        app = module.exports = express(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server);

    // Configure the Node.js application to handle the static files and
    // configure the Express router.
    app.configure(function () {
        "use strict";
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.static(__dirname + '/../www'));
        app.use(app.router);
    });

    // Provide configuration that is unique to running in development mode.
    app.configure('development', function () {
        "use strict";
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        //app.use(express.static(__dirname + '/../../client/test'));

    });

    // Provide configuration that is unique to running in production mode.
    app.configure('production', function () {
        "use strict";
        app.use(express.errorHandler());
    });

    // Load the socket and api modules so requests can be routed.
    require('./routes/socket')(io, require('./routes/api')());

    // Enable CORS (Cross-Origin Resource Sharing)
    // app.all('/*', function (req, res, next) {
    //     'use strict';

    //     res.header('Access-Control-Allow-Origin', '*');
    //     next();
    // });

    // Start the server.
    server.listen(portNum, function () {
        "use strict";
        console.log("Express server listening on port %d in %s mode.",
            this.address().port, app.settings.env);
    });
}


/**
 * Main routine for this executable.
 */
function main() {
    var argv = parseArgs(process.argv.slice(2));

    if ('help' in argv) {
        printUsage();
        return;
    }

    // Use the user supplied port number or default to 3000.
    runServer(argv.port || 3000);
}


main();
