const socketio = require('./socket');
const FormData = require('form-data');
const { config } = require('./config/config');
import Logger from './logger/Logger';

const logger = new Logger('BentoML');

class BentoML {
    constructor(roomId) {
        this._roomId = roomId;
    }

    analyze(peer, { buffer, relativeBox }) {
        const preAnalysisTimestamp = Date.now();
        const formData = new FormData();
        const annotations = {
            userId: peer.id,
            conferenceId: this._roomId,
        };

        formData.append("annotations", JSON.stringify(annotations));
        formData.append("image", buffer, "user.jpeg");
        formData.submit(config.bentoML.URI, function (err, res) {
            if (err) {
                logger.error('Sending image to BentoML failed [error:"%o"]', err);
            } else {
                const body = [];
                res.on("data", (chunk) => body.push(chunk));
                res.on("end", () => {
                    try {
                        const resString = Buffer.concat(body).toString();
                        const reply = JSON.parse(resString);
                        const analysisLatency = Date.now() - preAnalysisTimestamp;

                        if (analysisLatency > peer.emotion.msPerFrame) {
                            // Switch to lower fps if latency is too high. Using 5 consecutive dropped results to protect against outliers.
                            if (peer.emotion.droppedResults === 5) {
                                logger.debug('Reached upper limit of allowed consecutive result drops because of high latency. Lowering fps ... [latency:"%o" ]', analysisLatency);

                                peer.emotion.msPerFrame = 1000 / config.emotion.minFps;
                                peer.emotion.usingTargetFps = false;
                                peer.emotion.droppedResults = 0;
                            } else {
                                logger.debug('Dropping result because of high latency. [latency:"%o" ], [#droppedResults:"%o" ]',
                                    analysisLatency, peer.emotion.droppedResults)

                                peer.emotion.droppedResults++;
                            }

                            return;

                        } else {
                            logger.debug('BentoML analysis latency: %o', analysisLatency);

                            peer.emotion.droppedResults = 0;
                        }

                        if (reply.output.length > 0) {
                            logger.debug('BentoML reply containing results [#Emotions:"%o"]', reply.output.length);
                            // A relativeBox implies that face detection took place before bentoML analysis
                            const result = relativeBox ? { ...reply.emotions, boxes: [relativeBox] } : reply.emotions;
                            logger.debug('BentoML result: %o', result);
                            // send emotion to all subscribers
                            socketio.getio().to(reply.emotions.userId).volatile.emit('emotion', JSON.stringify(result));
                        }
                    } catch (error) {
                        logger.error("BentoML error", error);
                    }
                });
            }
        });


    }
}

export default BentoML;