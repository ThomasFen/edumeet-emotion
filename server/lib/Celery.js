const { config } = require('./config/config');
import Logger from './logger/Logger';
const logger = new Logger('Celery');

CELERY_BROKER_URL = "amqp://user:mypass@rabbitmq:5672";
CELERY_RESULT_BACKEND = "redis://myredis-headless:6379/0";


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
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    analyze(peer, { buffer, relativeBox }) {
        const preAnalysisTimestamp = Date.now();
        //const formData = new FormData();
        const annotations = {
            userId: peer.id,
            conferenceId: this._roomId,
        };
        msg_id =  makeid(20)
        request = {
            usr: peer.id,
            image: buffer, //msg.img,
            msg_id: msg_id,
            img_server_roundtrip_start: Date.now(),
            client_start_time: msg.client_start_time,
          };
          celery_app.sendTask("tasks.EmotionRecognition", "emotionrecognition", {
            request: request,
          });
    }
}

export default Celery;