// This Karma configuration will execute the unit tests and write the
// results to the artifacts folder.
//
// To run this configuration:
// karma start karma.dev.js

/* global module */
/* global require */

var karmautil = require('./karmautil');

module.exports = function (config) {
    "use strict";
    var devConfig = karmautil.getDevConfig('../../', 'www');
    config.set(devConfig);
};