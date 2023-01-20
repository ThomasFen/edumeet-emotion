// io = require('socket.io')(mainListener, { cookie: false });
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


const worker = io.of("/worker");
console.log(worker)
console.log(io)
// Handle worker connections.
worker.on("connection", (socket) => {
    console.log("sfu connected");

    socket.on("subscribe", function (patientId) {
      socket.join(patientId);
    });
    socket.on("unsubscribe", function (patientId) {
      socket.leave(patientId);
    });
   
    socket.on("disconnect", (reason) => {
      console.log("sfu disconnected");
    });
});


setInterval(function () {
    console.log("Sending heartbeat...");
    worker.emit("heartbeat", "this is worker heartbeat");
}, 3000);

http.listen(port = 3000, function () {
    console.log('listening on *:', port);
});