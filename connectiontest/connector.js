const io = require("socket.io-client")
//ioClient = io.connect("http://localhost:8010/sfu");

//ioClient.on("heartbeat", (msg) => console.info(msg));

class ConMgr {
  constructor() {
    const io = require("socket.io-client")
    this.socket = io.connect("http://localhost:3000/worker");
    this.socket.on("heartbeat", (msg) => console.info(msg));

   
  }
}

const conMgr = new ConMgr();
setInterval(function () {
    console.log("Sending result...");
    conMgr.socket.emit("send_result_to_server", {"data":"{'patientResult':'{usr: 1, image: 1, msg_id: 1, img_server_roundtrip_start: 1, client_start_time: 1}'}"});
}, 3000);