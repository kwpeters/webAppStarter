/* global require */
/* global console */

var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    os            = require('os'),
    path          = require('path'),
    projectConfig = require('./projectConfig'),
    mergeStream   = require('merge-stream'),
    bower         = require('gulp-bower'),
    rename        = require('gulp-rename'),
    less          = require('gulp-less'),
    minifyCss     = require('gulp-minify-css'),
    templateCache = require('gulp-angular-templatecache'),
    uglify        = require('gulp-uglify'),
    sourcemaps    = require('gulp-sourcemaps'),
    concat        = require('gulp-concat'),
    del           = require('del'),
    autoprefixer  = require('gulp-autoprefixer'),
    karma         = require('karma').server,
    karmaUtil     = require('./test/unit/karmautil'),
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
                cb(error);  // The task finished with an error.
            } else {
                cb();       // The task is now finished.
            }
        });
    }

    gulp.task('runServer:dev', ['build:dev'], function (cb) {
        runServer(buildTypeEnum.dev, cb);
    });

    gulp.task('runServer:prod', ['build:prod'], function (cb) {
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

        var htmlReplace = require('gulp-html-replace');

        return gulp.src('www/index.html', {cwdbase: true})
            .pipe(htmlReplace({
                thirdPartyCss: projectConfig.thirdPartyCssFiles[buildType],
                thirdPartyJs: projectConfig.thirdPartyJsFiles[buildType],
                firstPartyCss: projectConfig.firstPartyLessFiles.asCssFiles(buildType),
                firstPartyJs: projectConfig.firstPartyJsFiles[buildType]
            }))
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

    var rootLessFile = 'www/styles/app.less';

    function stageAppLess(buildType) {
        return gulp.src(rootLessFile, {cwdbase: true})
            .pipe(less({paths: [], relativeUrls: true}))
            .pipe(autoprefixer({browsers: ['last 2 versions'], cascade:false}))
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

    function getTemplateCacheStream() {
        return gulp.src('www/js/**/*.tc.html')
            .pipe(templateCache(
                path.join('www', 'js', projectConfig.templateCache.jsFile),
                {
                    //root: 'js',
                    module: projectConfig.templateCache.module,
                    standalone: true,
                    base: path.join(__dirname, 'www')       // Must be relative to index.html
                }
            ));
    }


    function stageAppJs(buildType) {
        var outputDir,
            jsSourcesStream,
            templateCacheSourcesStream,
            sourcesStream;

        jsSourcesStream = gulp.src(
            ['www/js/**/*.js', '!www/js/**/*.spec.js'],
            {cwdbase: true});
        templateCacheSourcesStream = getTemplateCacheStream();
        sourcesStream = mergeStream(jsSourcesStream, templateCacheSourcesStream);

        if (buildType === buildTypeEnum.dev) {
            // Nothing special needs to happen during dev builds.  The JS files
            // are just copied to dist/dev, using their relative paths.
            outputDir = buildTypeToDistDir(buildType);
        } else {
            // During concatenation for release builds, the relative paths of
            // each individual file in the stream will be lost.  So we have to
            // specify the full path of the directory where the concatenated JS
            // file will be written.
            outputDir = path.join(buildTypeToDistDir(buildType), 'www', 'js');
        }

        return sourcesStream
            .pipe(sourcemaps.init())
            .pipe(buildType === buildTypeEnum.prod ? uglify()                   : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? concat('app.min.js')       : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? sourcemaps.write('./maps') : gutil.noop())
            .pipe(gulp.dest(outputDir));
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
            'stageServer:dev',
            'stageBowerFiles:dev',
            'stageIndex:dev',
            'stageAppLess:dev',
            'stageAppResources:dev',
            'stageAppJs:dev'
        ]
    );

    gulp.task(
        'build:prod',
        [
            'stageServer:prod',
            'stageBowerFiles:prod',
            'stageIndex:prod',
            'stageAppLess:prod',
            'stageAppResources:prod',
            'stageAppJs:prod'
        ]
    );

    gulp.task('build', ['build:dev', 'build:prod']);

})();


////////////////////////////////////////////////////////////////////////////////
// Clean
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    gulp.task('clean', function (cb) {

        var globs = [
            'www/**/*.css',
            'www/bower_components',
            'dist',
            'artifacts/*'
        ];

        del(globs, cb);
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
        watcher;

    watcher = gulp.watch(globs, tasks);

    watcher.on('change', function (event) {
        gutil.log('');
        gutil.log('================================================================================');
        gutil.log('File ' + event.path + ' was ' + event.type + '.  Rebuilding...');
    });

});
