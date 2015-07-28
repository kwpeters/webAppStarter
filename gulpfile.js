/* global require */
/* global console */

var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    path          = require('path'),
    projectConfig = require('./projectConfig'),
    mergeStream   = require('merge-stream'),
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

    var os = require('os');

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
                gutil.colors.cyan("gulp clean:all"),
                "    Deletes build-generated files",
                "",
                gutil.colors.cyan("gulp jshint"),
                "    Performs static analysis on files",
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
// Stage all 3rd party front end files (Bower files)
//
(function () {
    "use strict";

    function stageBowerFiles(buildType) {

        var mergedStream = mergeStream(),
            outputDir = buildTypeToDistDir(buildType) + '/www';

        mergedStream.add(
            gulp.src(projectConfig.thirdPartyCssFiles[buildType], {cwdbase: true})
                .pipe(gulp.dest(outputDir))
        );

        mergedStream.add(
            gulp.src(projectConfig.thirdPartyJsFiles[buildType], {cwdbase: true})
                .pipe(gulp.dest(outputDir))
        );

        mergedStream.add(
            gulp.src(projectConfig.thirdPartyOtherFiles[buildType], {cwdbase: true})
                .pipe(gulp.dest(outputDir))
        );

        return mergedStream;
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
                firstPartyJs: projectConfig.getBuildOutputJsFiles(buildType)
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

    var less         = require('gulp-less'),
        autoprefixer = require('gulp-autoprefixer'),
        minifyCss    = require('gulp-minify-css'),
        rename       = require('gulp-rename');

    function stageAppLess(buildType) {

        var lessFilesFullPath = [];
        projectConfig.firstPartyLessFiles.forEach(function (curFile) {
            lessFilesFullPath.push('www/' + curFile);
        });

        return gulp.src(lessFilesFullPath, {cwdbase: true})
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
        var globs = projectConfig.firstPartyResourceFiles;

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

        var templateCache = require('gulp-angular-templatecache');

        return gulp.src('www/js/**/*.tc.html')
            .pipe(templateCache(
                path.join('www', 'js', projectConfig.templateCache.jsFile),
                {
                    //root: 'js',
                    module: projectConfig.templateCache.module,
                    standalone: true,
                    base: path.join(__dirname, 'www')       // Must be relative to index.html
                }
            )
        );
    }


    function stageAppJs(buildType) {
        var sourcemaps        = require('gulp-sourcemaps'),
            ts                = require('gulp-typescript'),
            uglify            = require('gulp-uglify'),
            concat            = require('gulp-concat'),
            concatOutputFile  = path.basename(projectConfig.getBuildOutputJsFiles(buildTypeEnum.prod)[0]),
            tsResult,
            tsSourcesExtPath,
            outputDir;

        tsSourcesExtPath = projectConfig.buildInputTsFiles.map(function (curInputJsFile) {
            return 'www/' + curInputJsFile;
        });

        tsResult = gulp.src(tsSourcesExtPath, {cwdbase: true})
            .pipe(sourcemaps.init())
            .pipe(ts({
                target:            'ES5',
                declarationFiles:  true,
                noExternalResolve: false
            }));

        // Combine the compiled TS output with the JS that is generated in order to
        // populate the template cache.
        var jsStream = mergeStream(
            tsResult.js,
            getTemplateCacheStream()
        );

        if (buildType === buildTypeEnum.dev) {
            // Nothing special needs to happen during dev builds.  The JS files
            // are just copied to dist/dev, using their relative paths.
            outputDir = buildTypeToDistDir(buildType);
        } else {
            // During concatenation for release builds, the relative paths of
            // each individual file in the stream will be lost.  So we have to
            // specify the full path of the directory where the concatenated JS
            // file will be written.
            outputDir = buildTypeToDistDir(buildType) + '/www/js';
        }

        jsStream = jsStream
            .pipe(buildType === buildTypeEnum.prod ? uglify()                   : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? concat(concatOutputFile)   : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? sourcemaps.write('./maps') : gutil.noop())
            .pipe(gulp.dest(outputDir));

        return mergeStream(
            jsStream,
            tsResult.dts.pipe(gulp.dest(buildTypeToDistDir(buildType) + '/definitions')));
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

    var del = require('del');

    gulp.task('clean', function (cb) {

        var globs = [
            'www/**/*.css',
            'dist',
            'artifacts/*',
            'build'
        ];

        del(globs, cb);
    });

    gulp.task('clean:all', ['clean'], function (cb) {

        var globs = [
            'bower_components',
            'node_modules'
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
(function () {
    "use strict";


    gulp.task('_compileTests', function () {
        var ts = require('gulp-typescript'),
            sourcemaps = require('gulp-sourcemaps'),
            tsResult;

        tsResult = gulp.src(projectConfig.unitTest.getTsFiles(), {cwdbase: true})
            .pipe(sourcemaps.init())
            .pipe(ts({target: 'ES5', declarationFiles: true, noExternalResolve: false}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(projectConfig.unitTest.getBuildDir()));

        return tsResult.js;
    });


    gulp.task('test:dev', ['build:dev', '_compileTests'], function (cb) {
        var karma       = require('karma').server,
            karmaUtil   = require('./test/unit/karmautil'),
            karmaConfig = karmaUtil.getDevConfig('./', 'dist/dev/www');

        karma.start(karmaConfig, cb);
    });

})();


////////////////////////////////////////////////////////////////////////////////
// Static Analysis - JSHint
////////////////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    var jshint      = require('gulp-jshint'),
        gulpHelpers = require('./nodeUtil/gulpHelpers');

    /**
     * Helper function that runs JSHint.
     * @param {boolean} ignoreErrors - true if errors should be ignored and the
     *     task should always succeed.  false if errors should cause the task to
     *     fail.
     * @returns {stream} The stream that runs JS files through JSHint.
     */
    function runJsHint(ignoreErrors) {
        return gulp
            .src(
            [
                'gulpfile.js',
                'nodeUtil/**/*.js',
                'www/**/*.js',          // All production JS files and all tests
                'test/unit/**/*.js'     // Unit test configuration files
            ], {base: '.'})
            .pipe(jshint())
            .pipe(gulpHelpers.createJsHintReporterConsole())
            .pipe(gulpHelpers.createJsHintReporterFile('artifacts/jshint_output.txt'))
            .pipe(gulpHelpers.jshintCheckstyleXmlReport('artifacts/jshint_output.xml'))
            .pipe(ignoreErrors ? gutil.noop() : jshint.reporter('fail'));
    }

    gulp.task('jshint', [], function () {
        return runJsHint(false);
    });

    gulp.task('jshint:ignoreErrors', [], function () {
        return runJsHint(true);
    });

})();


////////////////////////////////////////////////////////////////////////////////
// Watchers
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    var tasks        = ['jshint:ignoreErrors', 'test:dev'],
        onWatchEvent = function onWatchEvent(event) {
            gutil.log('');
            gutil.log('================================================================================');
            gutil.log('File ' + event.path + ' was ' + event.type + '.  Rebuilding...');
        };

    gulp.task('watch', tasks, function () {

        var globs = [
                'gulpfile.js',
                'www/js/**/*.js',
                'www/js/**/*.ts',
                'www/styles/*.less',
                'www/js/**/*.less',
                'www/**/*.html'
            ],
            watcher;

        watcher = gulp.watch(globs, tasks);
        watcher.on('change', onWatchEvent);
        return watcher;
    });
})();