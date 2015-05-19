/* global require */
/* global exports */

var through2 = require('through2'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    chalk = require('chalk');


/**
 * Formats a JSHint error in a standard way.
 * @param {object} file - The file being processed
 * @param {object} err - The JSHint error
 * @param {boolean} colorize - Whether to colorize the returned string
 * @returns {string} A string representation of the JSHint error
 */
function formatJsHintError(file, err, colorize) {
    "use strict";

    function passThrough(str) {return str;}

    var filePathFormatter = passThrough,
        locationFormatter = passThrough,
        errorCodeFormatter  = passThrough,
        reasonFormatter   = passThrough;

    if (colorize) {
        filePathFormatter = chalk.bold;
        locationFormatter = passThrough;
        errorCodeFormatter = chalk.red;
        reasonFormatter = chalk.red.bold;
    }

    return filePathFormatter(file.path) +
        locationFormatter('(' + err.line + ',' + err.character + '):') +
        errorCodeFormatter(err.code + ': ') +
        reasonFormatter(err.reason);
}


/**
 * Helper function that creates a JSHint reporter that will invoke a callback
 * once all files are processed.
 * @param {function} finishedCallback - A callback that will be invoked once
 *     the stream is flushed.  This callback will receive one argument, an array
 *     of strings containing the JSHint errors found.
 * @returns {stream} A stream that will pass objects from input to output
 *    without modifying them.
 */
function createJsHintReporter (finishedCallback) {
    "use strict";

    var reporter = function () {
        var jshintOutput = [],
            stream;

        // Creating a stream through which each file will pass
        stream = through2.obj(
            function onObject(file, enc, callback) {
                if (!file.jshint.success) {
                    file.jshint.results.forEach(function (err) {
                        if (err) {
                            jshintOutput.push(formatJsHintError(file, err.error, true));
                        }
                    });
                }
                this.push(file);
                return callback();
            },
            function onFlush(callback) {
                finishedCallback(jshintOutput);
                return callback();
            }
        );

        return stream;
    };

    return reporter();
}

/**
 * Creates a JSHint reporter that writes output to a file.
 * @param {string} outputFile - The file to write output to
 * @returns {stream} The stream
 */
exports.createJsHintReporterFile = function (outputFile) {
    "use strict";
    return createJsHintReporter(function (jshintOutput) {
        fs.writeFileSync(outputFile, jshintOutput.join(os.EOL));
    });
};

/**
 * Creates a JSHint reporter that writes output to the console.
 * @returns {stream} The stream
 */
exports.createJsHintReporterConsole = function () {
    "use strict";
    return createJsHintReporter(function (jshintOutput) {
        console.log(jshintOutput.join(os.EOL));
    });
};


/**
 * A JSHint reporter that that writes checkstyle XML output to a file.
 * @param {string} outputFile - The file to write results to
 * @returns {stream} The stream
 */
exports.jshintCheckstyleXmlReport = function (outputFile) {
    "use strict";

    //based on
    // https://github.com/mila-labs/jshint-checkstyle-file-reporter/blob/master/index.js

    var reportOut = [],
        finalOut = [],
        pairs = {
            "&": "&amp;",
            '"': "&quot;",
            "'": "&apos;",
            "<": "&lt;",
            ">": "&gt;"
        },
        relativeFilePath,
        severity,
        absSrcPath = path.join(path.resolve("."));

    function encode(s) {
        for (var r in pairs) {
            if (typeof(s) !== "undefined") {
                s = s.replace(new RegExp(r, "g"), pairs[r]);
            }
        }
        return s || "";
    }
    // Creating a stream through which each file will pass
    return through2.obj(
        function onObject(file, enc, callback) {
            if (!file.jshint.success) {
                relativeFilePath = "." + file.path.replace(absSrcPath  , '');
                reportOut.push("\t<file name=\"" + relativeFilePath + "\">");
                file.jshint.results.forEach(function (err) {
                    if (err) {
                        err = err.error;
                        severity = typeof err.code === 'string' && err.code[0] === 'W' ? 'warning' : 'error';
                        reportOut.push(
                            "\t\t<error " +
                            "line=\"" + err.line + "\" " +
                            "column=\"" + err.character + "\" " +
                            "severity=\"" + severity + "\" " +
                            "message=\"" + encode(err.reason) + "\" " +
                            "source=\"" + encode('jshint.' + err.code) + "\" " +
                            "/>"
                        );
                    }
                });
                reportOut.push("\t</file>");
            }
            this.push(file);
            return callback();
        },
        function onFlush(callback) {
            finalOut.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
            finalOut.push("<checkstyle version=\"4.3\">");
            finalOut = finalOut.concat(reportOut);
            finalOut.push("</checkstyle>");

            fs.writeFileSync(outputFile, finalOut.join('\n'));
            return callback();
        }
    );
};