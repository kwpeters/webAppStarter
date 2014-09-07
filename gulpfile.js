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
        return gulp.src('www/bower_components/**/*', {cwdbase: true})
            .pipe(gulp.dest(buildTypeToDistDir(buildType)));
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
            'www/images/**/*'
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

// todo: stage app js (concatenated or not)


gulp.task(
    'build:dev',
    [
        'stageServer:dev', 'stageBowerFiles:dev', 'stageIndex:dev',
        'stageAppLess:dev', 'stageAppResources:dev'
    ]
);
gulp.task(
    'build:prod',
    [
        'stageServer:prod', 'stageBowerFiles:prod', 'stageIndex:prod',
        'stageAppLess:prod', 'stageAppResources:prod'
    ]
);
gulp.task('build', ['build:dev', 'build:prod']);