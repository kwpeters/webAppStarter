/* global describe */
/* global beforeEach */
/* global inject */
/* global it */
/* global expect */

describe('homeViewCtrl', function () {
    "use strict";

    var scope, ctrl;

    beforeEach(module('homeViewModule'));
    beforeEach(module('socket-io'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('homeViewCtrl', {$scope: scope});
    }));

    it('should have a msg property', function () {
        expect(ctrl).toBeDefined();
    });

    it('should add a msg property to scope', function () {
        expect(scope.msg).toBeDefined();
        expect(scope.msg).toEqual('');
    });
});
