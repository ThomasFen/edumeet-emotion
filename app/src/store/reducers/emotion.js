import {
	ADD_EMOTION,
	DELETE_EMOTION,
	RESTART_EMOTION,
	INIT_EMOTION,
	SET_FACE_DETECTING
} from '../../actionTypes';

import {
	EMOTION_SURPRISE,
	EMOTION_NEUTRAL,
	EMOTION_SAD,
	EMOTION_FEAR,
	EMOTION_DISGUST,
	EMOTION_CONTEMPT,
	EMOTION_ANGER,
	EMOTION_HAPPY
} from '../../constants';

const initialState = {
	emotions        : {},
	boxes           : {},
	emotionHistory  : {},
	isFaceDetecting : false
};

const emotion = (state = initialState, action) =>
{
	switch (action.type)
	{
		case INIT_EMOTION: {
			return {
				...state,
				emotions : {
					...state.emotions,
					[action.payload.peerId] : null
				},
				boxes : {
					...state.boxes,
					[action.payload.peerId] : null
				},
				emotionHistory : {
					...state.emotionHistory,
					[action.payload.peerId] : {
						[EMOTION_HAPPY]    : [],
						[EMOTION_ANGER]    : [],
						[EMOTION_CONTEMPT] : [],
						[EMOTION_DISGUST]  : [],
						[EMOTION_FEAR]     : [],
						[EMOTION_SAD]      : [],
						[EMOTION_NEUTRAL]  : [],
						[EMOTION_SURPRISE] : []
					}
				}
			};
		}
		case RESTART_EMOTION: {
			return {
				...state,
				emotions : {
					...state.emotions,
					[action.payload.peerId] : null
				},
				boxes : {
					...state.boxes,
					[action.payload.peerId] : null
				}
			};
		}
		case ADD_EMOTION: {
			const peerEmotionHistory = state.emotionHistory[action.payload.peerId];
			const rawData = action.payload.rawData;

			return {
				...state,
				emotions : {
					...state.emotions,
					[action.payload.peerId] : action.payload.emotion
				},
				boxes : {
					...state.boxes,
					[action.payload.peerId] : action.payload.box
				},
				emotionHistory : {
					...state.emotionHistory,
					[action.payload.peerId] : {
						[EMOTION_HAPPY] : [ ...peerEmotionHistory[EMOTION_HAPPY],
							rawData[EMOTION_HAPPY] ],
						[EMOTION_ANGER] : [ ...peerEmotionHistory[EMOTION_ANGER],
							rawData[EMOTION_ANGER] ],
						[EMOTION_CONTEMPT] : [ ...peerEmotionHistory[EMOTION_CONTEMPT],
							rawData[EMOTION_CONTEMPT] ],
						[EMOTION_DISGUST] : [ ...peerEmotionHistory[EMOTION_DISGUST],
							rawData[EMOTION_DISGUST] ],
						[EMOTION_FEAR] : [ ...peerEmotionHistory[EMOTION_FEAR],
							rawData[EMOTION_FEAR] ],
						[EMOTION_NEUTRAL] : [ ...peerEmotionHistory[EMOTION_NEUTRAL],
							rawData[EMOTION_NEUTRAL] ],
						[EMOTION_SAD] : [ ...peerEmotionHistory[EMOTION_SAD],
							rawData[EMOTION_SAD] ],
						[EMOTION_SURPRISE] : [ ...peerEmotionHistory[EMOTION_SURPRISE],
							rawData[EMOTION_SURPRISE] ]
					}
				}
			};
		}

		case DELETE_EMOTION: {
			const newEmotions = { ...state.emotions };

			const newBoxes = { ...state.boxes };

			delete newEmotions[action.payload.peerId];

			delete newBoxes[action.payload.peerId];

			return {
				...state,
				emotions : newEmotions,
				boxes    : newBoxes
			};
		}

		case SET_FACE_DETECTING: {
			const { isFaceDetecting } = action.payload;

			return { ...state, isFaceDetecting: isFaceDetecting };
		}

		default:
			return state;
	}
};

export default emotion;