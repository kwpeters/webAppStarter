/* global describe */
/* global it */
/* global jasmine */

describe('Test to print out jasmine version that comes bundled with karam-jasmine', function() {
    "use strict";

    it('prints jasmine version', function() {
        console.log('jasmine-version:' + jasmine.getEnv().versionString());
    });
});