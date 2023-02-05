import {
	ADD_EMOTION,
	DELETE_EMOTION,
	RESTART_EMOTION,
	SET_FACE_DETECTING,
	TOGGLE_ADVANCED_EMOTION_MODE
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
	isFaceDetecting : false,
	settings      		: {
		advancedEmotionMode	: false
	}
};

const emotion = (state = initialState, action) =>
{
	switch (action.type)
	{
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
			const peerId = action.payload.peerId;
			const peerEmotionHistory = state.emotionHistory[peerId];
			const values = action.payload.values;

			if (!peerEmotionHistory)
			{
				return {
					...state,
					emotions : {
						...state.emotions,
						[peerId] : action.payload.emotion
					},
					boxes : {
						...state.boxes,
						[peerId] : action.payload.box
					},
					emotionHistory : {
						...state.emotionHistory,
						[peerId] : values ? {
							[EMOTION_HAPPY]    : [ values[EMOTION_HAPPY] ],
							[EMOTION_ANGER]    : [ values[EMOTION_ANGER] ],
							[EMOTION_CONTEMPT] : [ values[EMOTION_CONTEMPT] ],
							[EMOTION_DISGUST]  : [ values[EMOTION_DISGUST] ],
							[EMOTION_FEAR]     : [ values[EMOTION_FEAR] ],
							[EMOTION_SAD]      : [ values[EMOTION_SAD] ],
							[EMOTION_NEUTRAL]  : [ values[EMOTION_NEUTRAL] ],
							[EMOTION_SURPRISE] : [ values[EMOTION_SURPRISE] ]
						} : {
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

			return {
				...state,
				emotions : {
					...state.emotions,
					[peerId] : action.payload.emotion
				},
				boxes : {
					...state.boxes,
					[peerId] : action.payload.box
				},
				emotionHistory : {
					...state.emotionHistory,
					[peerId] : {
						[EMOTION_HAPPY] : [ ...peerEmotionHistory[EMOTION_HAPPY],
							values[EMOTION_HAPPY] ],
						[EMOTION_ANGER] : [ ...peerEmotionHistory[EMOTION_ANGER],
							values[EMOTION_ANGER] ],
						[EMOTION_CONTEMPT] : [ ...peerEmotionHistory[EMOTION_CONTEMPT],
							values[EMOTION_CONTEMPT] ],
						[EMOTION_DISGUST] : [ ...peerEmotionHistory[EMOTION_DISGUST],
							values[EMOTION_DISGUST] ],
						[EMOTION_FEAR] : [ ...peerEmotionHistory[EMOTION_FEAR],
							values[EMOTION_FEAR] ],
						[EMOTION_NEUTRAL] : [ ...peerEmotionHistory[EMOTION_NEUTRAL],
							values[EMOTION_NEUTRAL] ],
						[EMOTION_SAD] : [ ...peerEmotionHistory[EMOTION_SAD],
							values[EMOTION_SAD] ],
						[EMOTION_SURPRISE] : [ ...peerEmotionHistory[EMOTION_SURPRISE],
							values[EMOTION_SURPRISE] ]
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

		case TOGGLE_ADVANCED_EMOTION_MODE:
		{
			const advancedEmotionMode = !state.settings.advancedEmotionMode;

			return { ...state, settings: { ...state.settings, advancedEmotionMode } };
		}

		default:
			return state;
	}
};

export default emotion;