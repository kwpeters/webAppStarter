module.exports = function () {
    "use strict";

    var path = require('path'),
        api = {};

    api.getData = function (req, res) {

        var data = {data: [1, 2, 3]};
        res.send(data);
    };

    return api;
};