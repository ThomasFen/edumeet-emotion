const socketio = require('./socket');
const FormData = require('form-data');
const { config } = require('./config/config');

import Logger from './logger/Logger';

const logger = new Logger('BentoML');

class BentoML
{
	constructor(roomId)
	{
		this._roomId = roomId;
	}

	analyze({ peerId, authId, emotion }, { buffer, relativeBox })
	{
		const preAnalysisTimestamp = Date.now();
		const formData = new FormData();
		const clientFaceDetection = relativeBox == null ? false : true;
		const annotations = {
			peerId,
			authId,
			roomId : this._roomId,
			clientFaceDetection
		};

		formData.append('annotations', JSON.stringify(annotations));
		formData.append('image', buffer, 'user.jpeg');
		formData.submit(config.bentoML.URI, function(err, res)
		{
			if (err)
			{
				logger.error('Sending image to BentoML failed [error:"%o"]', err);
			}
			else
			{
				const body = [];

				res.on('data', (chunk) => body.push(chunk));
				res.on('end', () =>
				{
					try
					{
						const resString = Buffer.concat(body).toString();
						const reply = JSON.parse(resString);
						const analysisLatency = Date.now() - preAnalysisTimestamp;

						if (analysisLatency > emotion.msPerFrame)
						{
							// Switch to lower fps if latency is too high. Using 5 consecutive dropped 
							// results to protect against outliers.
							if (emotion.droppedResults === 5)
							{
								logger.debug('Reached upper limit of allowed consecutive result drops because of high latency. Lowering fps ... [latency:"%o" ]', analysisLatency);

								emotion.msPerFrame = 1000 / config.emotion.minFps;
								emotion.usingTargetFps = false;
								emotion.droppedResults = 0;
							}
							else
							{
								logger.debug('Dropping result because of high latency. [latency:"%o" ], [#droppedResults:"%o" ]',
									analysisLatency, emotion.droppedResults);

								emotion.droppedResults++;
							}

							return;

						}
						else
						{
							logger.debug('BentoML analysis latency: %o', analysisLatency);

							emotion.droppedResults = 0;
						}

						if (reply.emotions.length > 0)
						{
							logger.debug('BentoML reply containing results [#Emotions:"%o"]', reply.emotions.length);

							if (clientFaceDetection)
							{
								reply.emotions[0].box = relativeBox;
							}

							logger.debug('BentoML result: %o', reply);
							// send emotion to all subscribers
							socketio.getio().to(reply.peerId).volatile.emit('emotion', JSON.stringify(reply));
						}
					}
					catch (error)
					{
						logger.error('BentoML error', error);
					}
				});
			}
		});

	}
}

export default BentoML;