/* global describe */
/* global beforeEach */
/* global inject */
/* global it */
/* global expect */

describe('Test to print out jasmine version that comes bundled with karam-jasmine', function() {
    it('prints jasmine version', function() {
        console.log('jasmine-version:' + jasmine.getEnv().versionString());
    });
});