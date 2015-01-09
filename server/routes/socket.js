module.exports = function(io, api) {
    "use strict";

    io.on('connection', function(socket) {

        socket.on('get data', function() {
            socket.emit('data', api.getData());
        });

        socket.on('get message', function() {
            socket.emit('message', api.message());
        });

    });
};