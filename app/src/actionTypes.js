/**
 * Redux action type dispatched in order to add a emotion expression.
 *
 * {
 *      type: ADD_EMOTION,
 *      emotion: string,
 *      patientId: string
 * }
 */
export const ADD_EMOTION = 'ADD_EMOTION';

/**
 * Redux action type dispatched in order to restart emotion expression analysis.
 *
 * {
 *      type: RESTART_EMOTION,
 *      emotion: string,
 *      patientId: string
 * }
 */
export const RESTART_EMOTION = 'RESTART_EMOTION';

/**
* Redux action type dispatched in order to remove the emotion
* of a patient.
*
* {
*      type: DELETE_EMOTION,
*      patientId: string
* }
*/

export const DELETE_EMOTION = 'DELETE_EMOTION';

/**
* Redux action type dispatched in order to set the timestamp when the last
* last time a physician requested a patient to keep sending photos to socketIO.
*
* {
*      type: KEEP_SENDING,
*      timestamp: number
* }
*/

export const KEEP_SENDING = 'KEEP_SENDING';

/**
* Redux action type dispatched in order to set the time interval in which
* the message to socket.io server will be sent.
*
* {
*      type: SET_DETECTION_TIME_INTERVAL,
*      time: number
* }
*/
export const SET_DETECTION_TIME_INTERVAL = 'SET_DETECTION_TIME_INTERVAL';

/**
* Redux action type dispatched in order to set recognition active in the state.
*
* {
*      type: START_EMOTION_RECOGNITION
* }
*/
export const START_EMOTION_RECOGNITION = 'START_EMOTION_RECOGNITION';

/**
* Redux action type dispatched in order to set recognition inactive in the state.
*
* {
*      type: STOP_EMOTION_RECOGNITION
* }
*/
export const STOP_EMOTION_RECOGNITION = 'STOP_EMOTION_RECOGNITION';

/**
* Redux action type dispatched in order to set whether local face detection is active.
*
* {
*      type: TOGGLE_FACE_DETECTING_STATUS
* }
*/
export const TOGGLE_FACE_DETECTING_STATUS = 'TOGGLE_FACE_DETECTING_STATUS';

/**
* Redux action type dispatched to allow user finer grained emotion analysis options.
*
* {
*      type: TOGGLE_ADVANCED_EMOTION_MODE
* }
*/
export const TOGGLE_ADVANCED_EMOTION_MODE = 'TOGGLE_ADVANCED_EMOTION_MODE';