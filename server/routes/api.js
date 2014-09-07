module.exports = function () {
    "use strict";

    var path = require('path'),
        // Application information is stored in the project's package.json file.
        // We are loading that information directly from the file system.
        packageInfo = require(path.join('..', '..', '..', '..', 'package.json')),
        api = {};

    api.getData = function (req, res) {

        var data = {data: [1, 2, 3]};
        res.send(data);
    };

    api.getAppInfo = function (req, res) {
        // Respond with the information that was loaded from package.json.
        var appInfo = {
            name: packageInfo.name,
            version: packageInfo.version,
            description: packageInfo.description
        };
        res.send(appInfo);
    };

    return api;
};
