/* global angular */

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