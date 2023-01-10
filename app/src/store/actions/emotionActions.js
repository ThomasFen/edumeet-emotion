import {
	ADD_EMOTION,
	DELETE_EMOTION,
	INIT_EMOTION,
	RESTART_EMOTION,
	SET_FACE_DETECTING
} from '../../actionTypes';

export const initEmotion = (peerId) =>
	({
		type    : INIT_EMOTION,
		payload : { peerId }
	});

export const restartEmotion = (peerId) =>
	({
		type    : RESTART_EMOTION,
		payload : { peerId }
	});

export const addEmotion = (peerId, emotion, box, timestamp) =>
	({
		type    : ADD_EMOTION,
		payload : { peerId, emotion, box, timestamp }
	});

export const deleteEmotion = (peerId) =>
	({
		type    : DELETE_EMOTION,
		payload : { peerId }
	});

export const setFaceDetectionStatus = (isFaceDetecting) =>
	({
		type    : SET_FACE_DETECTING,
		payload : { isFaceDetecting }
	});
