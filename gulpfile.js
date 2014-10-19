/* global require */
/* global console */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    os = require('os'),
    path = require('path'),
    bower = require('gulp-bower'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    uglifyJs = require('gulp-uglifyjs'),
    rimraf = require('gulp-rimraf'),
    karma = require('karma').server,
    karmaUtil = require('./test/unit/karmautil'),
    buildTypeEnum = {dev: 'dev', prod: 'prod'};

function buildTypeToDistDir(buildType) {
    "use strict";

    if (buildType === buildTypeEnum.dev) {
        return 'dist/dev';
    } else if (buildType === buildTypeEnum.prod) {
        return 'dist/prod';
    } else {
        gutil.log(gutil.colors.red('Invalid build type!'));
    }
}


// todo: add running jshint (with coverage)

// todo: add running unit tests


////////////////////////////////////////////////////////////////////////////////
// Default Task - Usage
////////////////////////////////////////////////////////////////////////////////
(function () {
    "use strict";
    gulp.task('default', ['usage']);
})();


////////////////////////////////////////////////////////////////////////////////
// Usage
////////////////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    gulp.task('usage', function () {
        var padding = os.EOL + os.EOL,
            text = [
                gutil.colors.cyan("gulp build[:dev|prod]"),
                "    Builds this project (in /dist)",
                "",
                gutil.colors.cyan("gulp test:dev"),
                "    Runs the Karma/Jasmine unit tests",
                "",
                gutil.colors.cyan("gulp runServer:dev"),
                gutil.colors.cyan("gulp runServer:prod"),
                "    Runs the Node.js/Express web server",
                "",
                gutil.colors.cyan("gulp clean"),
                "    Deletes build-generated files",
                "",
                gutil.colors.cyan("gulp usage"),
                "    Displays this usage information",
                "",
                gutil.colors.cyan("gulp watch"),
                "    Watches for source file changes.  When seen, builds dev",
                "    configuration and runs unit tests"
            ];

        console.log(padding + text.join(os.EOL) + padding);
    });
})();


////////////////////////////////////////////////////////////////////////////////
// runServer
////////////////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    var exec = require('child_process').exec;

    function runServer(buildType, cb) {
        var cmd = 'node server',
            options = {
                cwd: path.join(buildTypeToDistDir(buildType), 'server')
            };

        exec(cmd, options, function (error /*, stdout, stderr*/) {

            if (error) {
                cb(error);  // Return error.
            }

            cb();           // The task is now finished.
        });
    }

    gulp.task('runServer:dev', ['build:dev'], function (cb) {
        runServer(buildTypeEnum.dev, cb);
    });

    gulp.task('runServer:prod', ['build:prod'] , function (cb) {
        runServer(buildTypeEnum.prod, cb);
    });

})();


////////////////////////////////////////////////////////////////////////////////
// Build
////////////////////////////////////////////////////////////////////////////////

//
// Stage server
//
(function () {
    "use strict";

    function stageServer(buildType) {
        return gulp.src('server/**/*', {cwdbase: true})
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
    }

    gulp.task('stageServer:dev', function () {
        return stageServer(buildTypeEnum.dev);
    });

    gulp.task('stageServer:prod', function () {
        return stageServer(buildTypeEnum.prod);
    });
})();


//
// Stage Bower components
//
(function () {
    "use strict";

    function stageBowerFiles(buildType) {
        var bowerDir = buildTypeToDistDir(buildType) + '/www/bower_components';
        return bower(bowerDir);
    }

    gulp.task('stageBowerFiles:dev', function () {
        return stageBowerFiles(buildTypeEnum.dev);
    });

    gulp.task('stageBowerFiles:prod', function () {
        return stageBowerFiles(buildTypeEnum.prod);
    });

})();


//
// Stage index.html
//
(function () {
    "use strict";

    function stageIndex(buildType) {
        var indexFileName = 'www/index-' + buildType + '.html';

        return gulp.src(indexFileName, {cwdbase: true})
            .pipe(rename({basename: 'index'}))
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));

    }

    gulp.task('stageIndex:dev', function () {
        return stageIndex(buildTypeEnum.dev);
    });

    gulp.task('stageIndex:prod', function () {
        return stageIndex(buildTypeEnum.prod);
    });

})();


//
// Stage app Less
//
(function () {
    "use strict";

    function stageAppLess(buildType) {
        return gulp.src('www/styles/*.less', {cwdbase: true})
            .pipe(less({paths: [], relativeUrls: true}))
            .pipe(buildType === buildTypeEnum.prod ? minifyCss() : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? rename({suffix: '.min'}) : gutil.noop())
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
    }

    gulp.task('stageAppLess:dev', function () {
        return stageAppLess(buildTypeEnum.dev);
    });

    gulp.task('stageAppLess:prod', function () {
        return stageAppLess(buildTypeEnum.prod);
    });

})();

//
// Stage app resources
//
(function () {
    "use strict";

    function stageAppResources(buildType) {
        var globs = [
            'www/fonts/**/*',
            'www/images/**/*',
            'www/js/**/*.html',
            '!www/js/**/*.tc.html' // Don't include templates that are placed in the template cache
        ];

        return gulp.src(globs, {cwdbase: true})
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
    }

    gulp.task('stageAppResources:dev', function () {
        return stageAppResources(buildTypeEnum.dev);
    });

    gulp.task('stageAppResources:prod', function () {
        return stageAppResources(buildTypeEnum.prod);
    });

})();

//
// Stage app JavaScript
//
(function () {
    "use strict";

    function stageAppJs(buildType) {
        var globs = [
            'www/js/**/*.js',
            '!www/js/**/*.spec.js'
        ];

        // todo: Create sourcemaps for prod builds and copy the original sources

        return gulp.src(globs, {cwdbase: true})
            .pipe(buildType === buildTypeEnum.prod ?
                uglifyJs('www/js/app.min.js', {outSourceMap: true}) :
                gutil.noop())
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
    }

    gulp.task('stageAppJs:dev', function () {
        return stageAppJs(buildTypeEnum.dev);
    });

    gulp.task('stageAppJs:prod', function () {
        return stageAppJs(buildTypeEnum.prod);
    });
})();


//
// Build tasks
//
(function () {

    "use strict";

    gulp.task(
        'build:dev',
        [
            'stageServer:dev', 'stageBowerFiles:dev', 'stageIndex:dev',
            'stageAppLess:dev', 'stageAppResources:dev', 'stageAppJs:dev'
        ]
    );

    gulp.task(
        'build:prod',
        [
            'stageServer:prod', 'stageBowerFiles:prod', 'stageIndex:prod',
            'stageAppLess:prod', 'stageAppResources:prod', 'stageAppJs:prod'
        ]
    );

    gulp.task('build', ['build:dev', 'build:prod']);

})();


////////////////////////////////////////////////////////////////////////////////
// Clean
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    gulp.task('clean', function () {
        var globs = [
            'www/**/*.css',
            'www/bower_components',
            'dist',
            'artifacts/*'
        ];

        return gulp.src(globs, {read: false})
            .pipe(rimraf());
    });
})();


////////////////////////////////////////////////////////////////////////////////
// Unit Tests - Karma
////////////////////////////////////////////////////////////////////////////////

// A Gulp plugin is not really needed to run Karma.  For now, we will just
// invoke the shell command to run Karma.  In the future, if more flexibility
// is needed, we can start running Karma using the Karma API as shown here:
// https://github.com/karma-runner/gulp-karma

gulp.task('test:dev', ['build:dev'], function (cb) {
    "use strict";

    var karmaConfig = karmaUtil.getDevConfig('./', 'dist/dev/www');
    karma.start(karmaConfig, cb);
});


////////////////////////////////////////////////////////////////////////////////
// Watchers
////////////////////////////////////////////////////////////////////////////////

gulp.task('watch', function (cb) {
    "use strict";

    var globs = [
            'www/js/**/*.js',
            'www/styles/*.less',
            'www/js/**/*.less',
            'www/**/*.html'
        ],
        tasks = ['test:dev'],
        watcher = gulp.watch(globs, tasks);

    watcher.on('change', function (event) {
        gutil.log('');
        gutil.log('================================================================================');
        gutil.log('File ' + event.path + ' was ' + event.type + '.  Rebuilding...');
    });

});
