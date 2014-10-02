module.exports = function () {
    "use strict";

    var api = {};

    api.getData = function (req, res) {

        var data = {data: [1, 2, 3]};
        res.send(data);
    };

    return api;
};