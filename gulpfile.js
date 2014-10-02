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
// Default Task
////////////////////////////////////////////////////////////////////////////////
(function () {
    "use strict";
    gulp.task('default', ['usage']);
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

    gulp.task('runServer:dev', function (cb) {
        runServer(buildTypeEnum.dev, cb);
    });

    gulp.task('runServer:prod', function (cb) {
        runServer(buildTypeEnum.prod, cb);
    });

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
                gutil.colors.cyan("gulp clean"),
                "    Deletes build-generated files",
                "",
                gutil.colors.cyan("gulp usage"),
                "    Displays this usage information"
            ];

        console.log(padding + text.join(os.EOL) + padding);
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
        bower(bowerDir);
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
            'www/js/**/*.js'
        ];

        // todo: Create sourcemaps for prod builds

        return gulp.src(globs, {cwdbase: true})
            .pipe(buildType === buildTypeEnum.prod ? uglifyJs('www/js/app.min.js') : gutil.noop())
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
    }

    gulp.task('stageAppJs:dev', function () {
        return stageAppJs(buildTypeEnum.dev);
    });

    gulp.task('stageAppJs:prod', function () {
        return stageAppJs(buildTypeEnum.prod);
    });
})();

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


////////////////////////////////////////////////////////////////////////////////
// Clean
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    gulp.task('clean', function () {
        var globs = [
            'www/**/*.css',
            'dist/dev',
            'dist/prod',
            'artifacts/*'
        ];

        return gulp.src(globs, {read: false})
            .pipe(rimraf());
    });
})();