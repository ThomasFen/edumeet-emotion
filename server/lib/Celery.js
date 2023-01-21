const { config } = require("./config/config");
import Logger from "./logger/Logger";
const logger = new Logger("Celery");

const CELERY_BROKER_URL = "amqp://user:mypass@10.243.64.9:31001";
//const CELERY_BROKER_URL = "amqp://user:mypass@rabbitmq:5672";
const CELERY_RESULT_BACKEND = "redis://10.243.64.9:30054/1";
//const CELERY_RESULT_BACKEND = "redis://myredis-headless:6379/0";
const celery = require("celery-node");
class Celery {
  constructor(roomId) {
    this._roomId = roomId;
    this.celery_app = celery.createClient(
      CELERY_BROKER_URL,
      CELERY_RESULT_BACKEND,
      "emotionrecognition"
    );
  }

  makeid(length) {
    let result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log("return msgid:", result);
    return result;
  }

  analyze(peer, { buffer, relativeBox }) {
    let b64_image = buffer.toString('base64');
    const preAnalysisTimestamp = Date.now();
    //const formData = new FormData();
    console.log("buffer:", buffer);
    const annotations = {
      userId: peer.id,
      conferenceId: this._roomId,
    };
    try {
      let msg_id = this.makeid(20);
      console.log("msg_id:", msg_id);
      let request = {
        usr: peer.id,
        image: b64_image, //msg.img,
        msg_id: msg_id,
        img_server_roundtrip_start: Date.now(),
        client_start_time: Date.now(),
      };
      this.celery_app.sendTask("tasks.EmotionRecognition", "emotionrecognition", {
        request: request,
      });
    } catch (e) {
      logger.error("Error in celery", e);
    }
  }
}

export default Celery;
