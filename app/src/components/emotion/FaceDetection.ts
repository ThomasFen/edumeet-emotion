import { BlazefaceWorkerManager, generateBlazefaceDefaultConfig } from '@about-slevin/blazeface-worker-js';
import Logger from '../../Logger';
import { RefObject } from 'react';
import { store } from '../../store/store';
import * as emotionActions from '../../store/actions/emotionActions';

const logger = new Logger('faceDetection');
const NO_REASON_GIVEN = 'No reason given';
const NO_VIDEO_REF = 'No video ref';
const REMOTE_REQUEST = 'Remote request';
const faceCanvas = document.createElement('canvas');
let faceDetectionRef: RefObject<HTMLVideoElement> | null = null;
let faceDetectionInverval: number;
let manager: BlazefaceWorkerManager;

type onFaceCallback = (options: { buffer: Blob;
	relativeBox: [number, number, number, number]; }) => void;

type reasons = typeof REMOTE_REQUEST | typeof NO_VIDEO_REF
	| typeof NO_REASON_GIVEN;

function setFaceDetectionRef(ref: RefObject<HTMLVideoElement> | null)
{
	faceDetectionRef = ref;
}

function videoIsReady(video: HTMLVideoElement, ...args: number[])
{
	const dimensionsMakeSense = args.every((arg) => arg > 0)
		&& video.videoWidth > 0 && video.videoHeight > 0;
	const videoIsPlaying = !video.paused
		&& video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

	const ready = videoIsPlaying && dimensionsMakeSense;

	if (!ready)
		logger.warn('Face detection/extraction won\'t be performed due to invalid dimensions or video not playing');

	return ready;
}

function extractFace(options: {
	topLeft: [number, number];
	bottomRight: [number, number];
	cb: onFaceCallback;
}): void
{
	if (!faceDetectionRef)
	{
		stopFaceDetection('No video ref');

		return;
	}

	const { topLeft: [ xMin, yMin ], bottomRight: [ xMax, yMax ], cb } = options;

	const video = faceDetectionRef.current;

	if (!video)
	{
		logger.warn('Video element not found. Cannot extract face');

		return;
	}

	const width = xMax - xMin;
	const height = yMax - yMin;
	const { videoWidth, videoHeight } = video;

	if (!videoIsReady(video, width, height, videoWidth, videoHeight))
		return;

	faceCanvas.width = width;
	faceCanvas.height = height;

	const ctx = faceCanvas.getContext('2d');

	try
	{
		ctx!.drawImage(video, xMin, yMin, width, height, 0, 0, width, height);
		faceCanvas.toBlob((blob) =>
		{
			if (blob)
			{
				const relativeBox: [number, number, number, number] =
				[ yMin / videoHeight, xMin / videoWidth,
					yMax / videoHeight, xMax / videoWidth ];

				cb({ buffer: blob, relativeBox });
			}
		}, 'image/jpeg', 1);
	}
	catch (error)
	{
		logger.warn('Face extraction failed', error);
	}

}

async function createManager()
{
	let useWorker = true;

	if (!window.Worker)
	{
		useWorker = false;
	}
	const blazeConfig = generateBlazefaceDefaultConfig();

	// @ts-ignore
	manager = new BlazefaceWorkerManager();
	await manager.init({ ...blazeConfig,
		backendType    : 'wasm', // 'wasm' | 'webgl' | 'cpu'
		processOnLocal : !useWorker,
		iouThreshold   : 0.3,
		scoreThreshold : 0.65
		// modelUrl       : '' 
	});

}

async function startFaceDetection(cb: onFaceCallback, sendFps = 10)
{
	logger.debug('Starting face detection. FPS:', sendFps);

	const intervalLength = 1000 / sendFps;
	const { isFaceDetecting } = store.getState().emotion.settings;

	if (!manager)
		await createManager();

	if (isFaceDetecting)
	{
		clearInterval(faceDetectionInverval);

		logger.debug('Face detection already running. Updating FPS and callback');
	}

	faceDetectionInverval = window.setInterval(async () =>
	{
		if (!faceDetectionRef)
		{
			stopFaceDetection('No video ref');

			return;
		}
		const video = faceDetectionRef.current;

		if (video)
		{
			const { videoWidth, videoHeight } = video;

			if (!videoIsReady(video, videoWidth, videoHeight))
				return;

			// For the workermanager not to complain
			video.width = videoWidth;
			video.height = videoHeight;
			const currentParams = {
				annotateBox         : false,
				movingAverageWindow : 0,
				processWidth        : videoWidth,
				processHeight       : videoHeight };

			const prediction = await manager.predict(currentParams, video);

			if (prediction?.rowPrediction?.[0])
			{
				logger.debug('Face detection result', prediction);
				const { rowPrediction: [ { topLeft, bottomRight } ] } = prediction;

				extractFace(
					{ topLeft     : topLeft as [number, number],
						bottomRight : bottomRight as [number, number],
						cb });
			}
		}
		else
		{
			logger.warn('Video element not found. Cannot run face detection');
		}

	}, intervalLength);

	store.dispatch(
		emotionActions.toggleFaceDetectionStatus());

}

function stopFaceDetection(reason: reasons = 'No reason given')
{
	logger.debug(`Stopping face detection. Reason: ${reason}`);

	clearInterval(faceDetectionInverval);

	store.dispatch(
		emotionActions.toggleFaceDetectionStatus());
}

export { setFaceDetectionRef, startFaceDetection, stopFaceDetection };