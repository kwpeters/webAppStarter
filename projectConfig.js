module.exports = (function () {
    "use strict";

    var gutil         = require('gulp-util'),
        path          = require('path'),
        projectConfig = {};

    ////////////////////////////////////////////////////////////////////////////
    //
    // 3rd party files
    //
    ////////////////////////////////////////////////////////////////////////////

    projectConfig.thirdPartyCssFiles = {
        dev: [
            'bower_components/bootstrap/dist/css/bootstrap.css'
        ],
        prod: [
            'bower_components/bootstrap/dist/css/bootstrap.min.css'
        ]
    };

    projectConfig.thirdPartyJsFiles = {
        dev: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-touch/angular-touch.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.js',
            'bower_components/bootstrap/dist/js/bootstrap.js'
            ],
        prod: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'bower_components/angular-resource/angular-resource.min.js',
            'bower_components/angular-cookies/angular-cookies.min.js',
            'bower_components/angular-touch/angular-touch.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js'
        ]
    };

    projectConfig.thirdPartyUnitTestJsFiles = [
        'bower_components/angular-mocks/angular-mocks.js'
    ];

    projectConfig.thirdPartyOtherFiles = {
        dev: [
            'bower_components/bootstrap/dist/css/bootstrap.css.map'
        ],
        prod: [
            'bower_components/jquery/dist/jquery.min.map',
            'bower_components/angular/angular.min.js.map',
            'bower_components/angular-resource/angular-resource.min.js.map',
            'bower_components/angular-cookies/angular-cookies.min.js.map',
            'bower_components/angular-touch/angular-touch.min.js.map',
            'bower_components/angular-animate/angular-animate.min.js.map'
        ]
    };

    ////////////////////////////////////////////////////////////////////////////
    //
    // 1st party files
    //
    ////////////////////////////////////////////////////////////////////////////

    projectConfig.firstPartyLessFiles = [
        'styles/app.less'
    ];

    projectConfig.firstPartyLessFiles.asCssFiles = function (buildType) {
        var newExtension,
            cssFiles = [];

        if (buildType === 'dev') {
            newExtension = '.css';
        } else {
            newExtension = '.min.css';
        }

        projectConfig.firstPartyLessFiles.forEach(function (curLessFile) {
            cssFiles.push(gutil.replaceExtension(curLessFile, newExtension));
        });

        return cssFiles;
    };
    
    projectConfig.buildInputJsFiles = [
        'js/views/homeView.js',
        'js/app.js'];

    projectConfig.getBuildOutputJsFiles = function getBuildOutputJsFiles(buildType) {

        if (buildType === 'prod') {
            return 'js/app.min.js';
        }

        return projectConfig.buildInputJsFiles.concat(
            [path.join('js', projectConfig.templateCache.jsFile)]
        );
    };

    projectConfig.firstPartyResourceFiles = [
        'www/fonts/**/*',
        'www/images/**/*',
        'www/js/**/*.html',
        '!www/js/**/*.tc.html' // Don't include templates that are placed in the template cache
    ];

    projectConfig.templateCache = {
        jsFile: 'templateCache.js',
        module: 'templateCacheModule'
    };

    return projectConfig;
})();