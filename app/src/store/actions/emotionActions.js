import {
	ADD_EMOTION,
	DELETE_EMOTION,
	RESTART_EMOTION,
	TOGGLE_FACE_DETECTING_STATUS,
	TOGGLE_ADVANCED_EMOTION_MODE
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

export const toggleFaceDetectionStatus = () =>
	({
		type : TOGGLE_FACE_DETECTING_STATUS
	});

export const toggleAdvancedEmotionMode = () =>
	({
		type : TOGGLE_ADVANCED_EMOTION_MODE
	});
