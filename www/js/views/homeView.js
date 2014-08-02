angular.module(
    'homeView',
    [])
.controller(
    'homeViewCtrl',
    [
        '$scope',
        function ($scope) {
            'use strict';
            $scope.msg = 'Hello world.';
        }
    ]
);