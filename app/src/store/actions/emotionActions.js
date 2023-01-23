import {
	ADD_EMOTION,
	DELETE_EMOTION,
	RESTART_EMOTION,
	SET_FACE_DETECTING
} from '../../actionTypes';

export const restartEmotion = (peerId) =>
	({
		type    : RESTART_EMOTION,
		payload : { peerId }
	});

export const addEmotion = ({ peerId, emotion = null, box = null, values = null }) =>
	({
		type    : ADD_EMOTION,
		payload : { peerId, emotion, box, values }
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
