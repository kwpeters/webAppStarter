var gulp = require('gulp'),
    gutil = require('gulp-util'),
    buildTypeEnum = {dev: 'dev', prod: 'prod'};

function buildTypeToDistDir(buildType) {
    "use strict";

    if (buildType === buildTypeEnum.dev) {
        return 'dist/dev';
    } else if (buildType === buildTypeEnum.prod) {
        return 'dist/prod';
    } else
    {
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

// todo: stage www/bower_components to dist/[dev|prod]/www/bower_components

// todo: stage index.html
//     - www/index.[dev|prod].html to dist/[dev|prod]/www/index.html

// todo: stage app less

// todo: stage app assets

// todo: stage app js (concatenated or not)



gulp.task('build:dev',  []);
gulp.task('build:prod', []);
gulp.task('build', ['build:dev', 'build:prod']);


