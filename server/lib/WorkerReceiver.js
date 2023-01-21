const socketio = require('./socket');
class WorkerSocketServer {
  constructor() {
    console.log("WorkerSocketServer constructor");
  }

  async runWebSocketServerWorker() {
    console.log("runWebSocketServerWorker");
    var app2 = require("express")();
    var http2 = require("http").createServer(app2);
    var io2 = require("sockio4")(http2);

    const worker = io2.of("/worker");
    console.log(worker);
    console.log(io2);
    console.log("worker ws ready");
    // Handle worker connections.
    worker.on("connection", (socket2) => {
      console.log("worker connected");

      socket2.on("subscribe", function (patientId) {
        console.log("subscribe");
        socket2.join(patientId);
      });
      socket2.on("unsubscribe", function (patientId) {
        console.log("unsubscribe");
        socket.leave(patientId);
      });
      socket2.on("disconnect", (reason) => {
        console.log("unsubscribe");
        console.log("worker disconnected");
      });
      socket2.on("send_result_to_server", (msg) => {
        console.log("received worker result");
        for (const patientResult of msg["data"]) {
          //let result = JSON.stringify(patientResult)
  
          // TODO REFACTOR THIS!!
          const final_result = { emotions:patientResult["emotions"], "boxes": [patientResult["relativeBox"]] }



          console.log("sending result: ", final_result);
          socketio
            .getio()
            .to(patientResult.usr)
            .emit("emotion", JSON.stringify(final_result) );
        }
      });
    });

    setInterval(function () {
      console.log("Sending heartbeat...");
      worker.emit("heartbeat", "this is worker heartbeat");
    }, 3000);

    http2.listen(8010, function () {
      console.log("listening on *:8010");
    });
  }
}

module.exports = WorkerSocketServer;