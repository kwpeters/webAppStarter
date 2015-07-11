///<reference path="../../../typings/tsd.d.ts"/>

angular.module('homeViewModule', [])
    .controller(
    'homeViewCtrl',
    [
        '$scope',
        function ($scope) {
            'use strict';
            $scope.msg = 'Hello world';
        }
    ]
);