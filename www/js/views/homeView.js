/* global angular */

angular.module('homeViewModule', [])
    .controller(
    'homeViewCtrl',
    [
        '$scope',
        'socket',
        function ($scope, socket) {
            'use strict';

            $scope.msg = "";

            socket.emit('get message');
            socket.on('message', function(msg) {
                $scope.msg = msg;
            });
        }
    ]
);