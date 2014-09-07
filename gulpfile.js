var gulp = require('gulp'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
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

// todo: add "build:dev" and "build:prod"

// todo: add running unit tests


gulp.task('default', function () {
    // todo: Figure out which task should be the default.
});


////////////////////////////////////////////////////////////////////////////////
// Build
////////////////////////////////////////////////////////////////////////////////

//
// Stage server
//
(function () {
    "use strict";

    function stageServer(buildType) {
        gulp.src('server/**/*')
            .pipe(gulp.dest(buildTypeToDistDir(buildType) + '/server'));
    }

    gulp.task('stageServer:dev', function () {
        stageServer(buildTypeEnum.dev);
    });

    gulp.task('stageServer:prod', function () {
        stageServer(buildTypeEnum.prod);
    });
})();


//
// Stage Bower components
//
(function () {
    "use strict";

    function stageBowerFiles(buildType) {
        gulp.src('www/bower_components/**/*')
            .pipe(gulp.dest(buildTypeToDistDir(buildType) + '/www/bower_components'));
    }

    gulp.task('stageBowerFiles:dev', function () {
        stageBowerFiles(buildTypeEnum.dev);
    });

    gulp.task('stageBowerFiles:prod', function () {
        stageBowerFiles(buildTypeEnum.prod);
    });
})();


//
// Stage index.html
//
(function () {
    "use strict";

    function stageIndex(buildType) {
        var indexFileName = 'www/index-' + buildType + '.html';

        gulp.src(indexFileName)
            .pipe(rename({basename: 'index'}))
            .pipe(gulp.dest(buildTypeToDistDir(buildType) + '/www'));

    }

    gulp.task('stageIndex:dev', function () {
        stageIndex(buildTypeEnum.dev);
    });

    gulp.task('stageIndex:prod', function () {
        stageIndex(buildTypeEnum.prod);
    });

})();


// todo: stage app less
//
// Stage app Less
//
(function () {
    "use strict";

    function stageAppLess(buildType) {
        gulp.src('www/styles/*.less')
            .pipe(less({paths: [], relativeUrls: true}))
            .pipe(buildType === buildTypeEnum.prod ? minifyCss() : gutil.noop())
            .pipe(buildType === buildTypeEnum.prod ? rename({suffix: '.min'}) : gutil.noop())
            .pipe(gulp.dest(buildTypeToDistDir(buildType) + '/www/styles'));
    }

    gulp.task('stageAppLess:dev', function () {
        stageAppLess(buildTypeEnum.dev);
    });

    gulp.task('stageAppLess:prod', function () {
        stageAppLess(buildTypeEnum.prod);
    });
})();

// todo: stage app assets

// todo: stage app js (concatenated or not)


gulp.task('build:dev', []);
gulp.task('build:prod', []);
gulp.task('build', ['build:dev', 'build:prod']);