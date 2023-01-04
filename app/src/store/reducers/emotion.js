import {
	ADD_EMOTION,
	DELETE_EMOTION,
	INIT_EMOTION
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
	emotions       : {},
	emotionHistory : {}
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
					[action.payload.peerId] : '-1'
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
		case ADD_EMOTION: {
			return {
				...state,
				emotions : {
					...state.emotions,
					[action.payload.peerId] : action.payload.emotion
				},
				emotionHistory : {
					...state.emotionHistory,
					[action.payload.peerId] : {
						...state.emotionHistory[action.payload.peerId],
						[action.payload.emotion] : [
							...state.emotionHistory[action.payload.peerId][
								action.payload.emotion
							],
							action.payload.timestamp
						]
					}
				}
			};
		}

		case DELETE_EMOTION: {
			const newEmotions = { ...state.emotions };

			delete newEmotions[action.payload.peerId];

			return {
				...state,
				emotions : newEmotions
			};
		}

		default:
			return state;
	}
};

export default emotion;