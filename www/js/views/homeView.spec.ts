///<reference path="../../../typings/tsd.d.ts"/>

describe('homeViewCtrl', function () {
    "use strict";

    var scope, ctrl;

    beforeEach(module('homeViewModule'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('homeViewCtrl', {$scope: scope});
    }));

    it('should exist', function () {
        expect(ctrl).toBeDefined();
    });

    it('should add a msg property to scope', function () {
        expect(scope.msg).toBeDefined();
        expect(scope.msg).toEqual('Hello world');
    });
});
