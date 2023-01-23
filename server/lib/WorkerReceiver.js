const socketio = require("./socket");
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
        console.log(msg);
        for (const patientResult of msg["data"]) {
          //let result = JSON.stringify(patientResult)

          // TODO REFACTOR THIS!!
          emotion_classes = {0: "Neutral", 1: "Happy", 2: "Sad", 3:"Surprise", 4: "Fear", 5: "Disgust", 6: "Anger", 7: "Contempt"}
          //const final_result = { emotions:[{raw: patientResult["emotions"], 'dominantEmotion':'happy'}], "boxes": [patientResult["relativeBox"]] }
          // get index of max value of  emotion from patientResult["emotions"]
          const indexOfDominantEmotion = patientResult["emotions"].indexOf(Math.max(...patientResult["emotions"]));
          const final_result = { 
            'userId': patientResult["usr"], 
            'date': Date.now(),
            'emotions': [{
              'raw':{
                'happy': {'date':Date.now(), 'value':patientResult["emotions"][1]}, 
                'sad': {'date':Date.now(), 'value':patientResult["emotions"][2]}, 
                'neutral': {'date':Date.now(), 'value':patientResult["emotions"][0]}, 
                'surprise': {'date':Date.now(), 'value':patientResult["emotions"][3]}, 
                'fear': {'date':Date.now(), 'value':patientResult["emotions"][4]}, 
                'disgust': {'date':Date.now(), 'value':patientResult["emotions"][5]},
                'anger': {'date':Date.now(), 'value':patientResult["emotions"][6]},
                'contempt': {'date':Date.now(), 'value':patientResult["emotions"][7]},
              },
            'dominantEmotion': emotion_classes[indexOfDominantEmotion]
            }], 
            'boxes': [patientResult["relativeBox"]] 
          }



          console.log("sending result: ", final_result);
          socketio
            .getio()
            .to(patientResult.usr)
            .emit("emotion", JSON.stringify(final_result));
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
