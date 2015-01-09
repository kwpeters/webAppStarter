module.exports = function () {
    "use strict";

    var api = {};

    api.getData = function () {
        return {data: [1, 2, 3]};
    };

    api.message = function() {
        return "Hello World!";
    };

    return api;
};