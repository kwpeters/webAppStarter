/*
 * This module exposes the Karma configurations for this project.  These
 * configurations are used by the Gulp build system as well as by individual
 * Karma configuration files (which can then be used from IDEs with Karma
 * integration, such as WebStorm).
 */

/* global module */
/* global require */


module.exports = {};


/**
 * Private helper function that gets Karma configuration options that are common
 * to all configurations.
 * @returns {object} Configuration options that are common to all configurations.
 */
function getBaseConfig(pathToRoot, pathRootToWww) {
    "use strict";

    var baseConfig = {};

    // All paths are relative to the root of the project.
    baseConfig.basePath = pathToRoot;

    baseConfig.frameworks = ['jasmine'];

    // List of files/patterns to load in the browser
    baseConfig.files = [];
    [
        // 3rd party JS
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-resource/angular-resource.min.js',
        'bower_components/angular-cookies/angular-cookies.min.js',
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-local-storage/angular-local-storage.min.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/angular-socket-io/mock/socket-io.js',
        'bower_components/ng-socket-io/ng-socket-io.min.js',

        // 3rd party CSS
        'bower_components/bootstrap/dist/css/bootstrap.min.css'
    ].forEach(function (curPath) {
            baseConfig.files.push(pathRootToWww + '/' + curPath);
    });

    // list of files to exclude
    baseConfig.exclude = [];

    // Test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    baseConfig.reporters = ['progress', 'coverage', 'junit'];

    // Web server port
    baseConfig.port = 9876;

    // Enable / disable colors in the output (reporters and logs)
    baseConfig.colors = true;

    // Enable/disable watching file and executing tests whenever any file
    // changes
    baseConfig.autoWatch = false;

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    baseConfig.browsers = ['PhantomJS'];

    // If browser does not capture in given timeout [ms], kill it
    baseConfig.captureTimeout = 60000;

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    baseConfig.singleRun = true;

    // Note:  require() is used here, because Karma only loads plugins
    //        in sibling directories.  We will use Node's normal
    //        module loading behavior so they are loaded from the project's
    //        root directory.
    baseConfig.plugins = [
        require('karma-jasmine'),
        require('karma-coverage'),
        require('karma-chrome-launcher'),
        require('karma-phantomjs-launcher'),
        //require('karma-firefox-launcher'),
        require('karma-spec-reporter'),
        require('karma-junit-reporter')
    ];

    return baseConfig;
}


/**
 * Gets the "dev" Karma configuration.
 * @returns {object} The "dev" Karma configuration
 */
module.exports.getDevConfig = function getDevConfig (pathToRoot, pathRootToWww) {
    "use strict";

    var config = getBaseConfig(pathToRoot, pathRootToWww);

    //
    // files
    //

    // Files under test
    [
        'styles/app.css',
        'js/**/*.js'
    ].forEach(function (curPath) {
        config.files.push(pathRootToWww + '/' + curPath);
    });

    // Test files
    // The path to the test files will not necessarily be in the www folder
    // specified by the caller (i.e. dist/dev/www), because the test files
    // are not staged to dist when the project builds.  Instead, always use
    // the test files from their source directory.
    config.files = config.files.concat(['www/js/**/*.spec.js']);

    //
    // preprocessors
    //
    config.preprocessors = {
        // Source files, that you want to generate coverage for.  Do not
        // include test files or library files.  These files will be
        // instrumented by Istanbul.
        '**/www/js/**/!(*.spec).js': ['coverage']
    };

    //
    // JUnit reporter
    //
    config.junitReporter = {
        // This path will be resolved to basePath (in the same way as files and
        // exclude patterns)
        outputFile: 'artifacts/app-ut-dev.xml',
        suite: 'app-dev'
    };

    //
    // Coverage reporter
    //
    config.coverageReporter = {
        type: 'html',
        dir: 'artifacts/app-coverage-dev/'
    };

    return config;
};