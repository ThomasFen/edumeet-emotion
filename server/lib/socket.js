let io;
module.exports = {
    init: function (mainListener) {
        // start socket.io server and cache io value
        io = require('socket.io')(mainListener, { cookie: false });
        return io;
    },
    getio: function () {
        return io;
    }
}