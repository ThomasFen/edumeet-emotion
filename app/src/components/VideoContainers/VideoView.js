import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import EditableInput from '../Controls/EditableInput';
import Logger from '../../Logger';
import { yellow, orange, red } from '@material-ui/core/colors';
import SignalCellularOffIcon from '@material-ui/icons/SignalCellularOff';
import SignalCellular0BarIcon from '@material-ui/icons/SignalCellular0Bar';
import SignalCellular1BarIcon from '@material-ui/icons/SignalCellular1Bar';
import SignalCellular2BarIcon from '@material-ui/icons/SignalCellular2Bar';
import SignalCellular3BarIcon from '@material-ui/icons/SignalCellular3Bar';
import { AudioAnalyzer } from './AudioAnalyzer';
import EmotionBoxes from './EmotionBoxes';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as faceMesh from '@mediapipe/face_mesh';
import { config } from '../../config';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';

const logger = new Logger('VideoView');

const styles = (theme) =>
	({
		root :
		{
			position      : 'relative',
			flex          : '100 100 auto',
			height        : '100%',
			width         : '100%',
			display       : 'flex',
			flexDirection : 'column',
			overflow      : 'hidden'
		},

		video :
		{
			flex               : '100 100 auto',
			height             : '100%',
			width              : '100%',
			objectFit          : 'contain',
			userSelect         : 'none',
			transitionProperty : 'opacity',
			transitionDuration : '.15s',
			backgroundColor    : 'var(--peer-video-bg-color)',
			'&.isMirrored'     :
			{
				transform : 'scaleX(-1)'
			},
			'&.hidden' :
			{
				opacity            : 0,
				transitionDuration : '0s'
			},
			'&.loading' :
			{
				filter : 'blur(5px)'
			},
			'&.contain' :
			{
				objectFit       : 'contain',
				backgroundColor : 'rgba(0, 0, 0, 1)'
			}
		},
		info :
		{
			width          : '100%',
			height         : '100%',
			padding        : theme.spacing(1),
			position       : 'absolute',
			zIndex         : 10,
			display        : 'flex',
			flexDirection  : 'column',
			justifyContent : 'space-between'
		},
		media :
		{
			display            : 'flex',
			transitionProperty : 'opacity',
			transitionDuration : '.15s',
			alignItems         : 'flex-start'
		},
		box :
		{
			padding      : theme.spacing(0.5),
			borderRadius : 2,
			userSelect   : 'none',
			margin       : 0,
			color        : 'rgba(255, 255, 255, 0.7)',
			fontSize     : '0.8em',

			'&.left' :
				{
					backgroundColor : 'rgba(0, 0, 0, 0.25)',
					display         : 'grid',
					gap             : '1px 5px',

					// eslint-disable-next-line
					gridTemplateAreas : '\
					"AcodL		Acod	Acod	Acod	Acod" \
					"VcodL		Vcod	Vcod	Vcod	Vcod" \
					"ResL		Res		Res		Res		Res" \
					"VPortL		VPort VPort VPort VPort" \
					"RecvL		RecvBps RecvBps RecvSum RecvSum" \
					"SendL		SendBps SendBps SendSum SendSum" \
					"IPlocL		IPloc	IPloc	IPloc	IPloc" \
					"IPsrvL		IPsrv	IPsrv	IPsrv	IPsrv" \
					"STLcurrL	STLcurr	STLcurr STLcurr STLcurr" \
					"STLprefL	STLpref STLpref STLpref STLpref"',

					'& .AcodL'    : { gridArea: 'AcodL' },
					'& .Acod'     : { gridArea: 'Acod' },
					'& .VcodL'    : { gridArea: 'VcodL' },
					'& .Vcod'     : { gridArea: 'Vcod' },
					'& .ResL'     : { gridArea: 'ResL' },
					'& .Res'      : { gridArea: 'Res' },
					'& .VPortL'   : { gridArea: 'VPortL' },
					'& .VPort'    : { gridArea: 'VPort' },
					'& .RecvL'    : { gridArea: 'RecvL' },
					'& .RecvBps'  : { gridArea: 'RecvBps', justifySelf: 'flex-end' },
					'& .RecvSum'  : { gridArea: 'RecvSum', justifySelf: 'flex-end' },
					'& .SendL'    : { gridArea: 'SendL' },
					'& .SendBps'  : { gridArea: 'SendBps', justifySelf: 'flex-end' },
					'& .SendSum'  : { gridArea: 'SendSum', justifySelf: 'flex-end' },
					'& .IPlocL'   : { gridArea: 'IPlocL' },
					'& .IPloc'    : { gridArea: 'IPloc' },
					'& .IPsrvL'   : { gridArea: 'IPsrvL' },
					'& .IPsrv'    : { gridArea: 'IPsrv' },
					'& .STLcurrL' : { gridArea: 'STLcurrL' },
					'& .STLcurr'  : { gridArea: 'STLcurr' },
					'& .STLprefL' : { gridArea: 'STLprefL' },
					'& .STLpref'  : { gridArea: 'STLpref' }

				},
			'&.right' :
			{
				marginLeft : 'auto',
				width      : 30
			},
			'&.hidden' :
			{
				display : 'none'
			},
			'&.audioAnalyzer' :
			{
				width           : '30%',
				height          : '30%',
				minWidth        : '180px',
				minHeight       : '120px',
				marginLeft      : theme.spacing(0.5),
				backgroundColor : 'rgba(0, 0, 0, 0.25)'
			}
		},
		peer :
		{
			display : 'flex'
		},
		displayNameEdit :
		{
			fontSize        : 14,
			fontWeight      : 400,
			color           : 'rgba(255, 255, 255, 0.85)',
			border          : 'none',
			borderBottom    : '1px solid #aeff00',
			backgroundColor : 'rgba(0, 0, 0, 0.25)',
			padding         : theme.spacing(0.6)
		},
		displayNameStatic :
		{
			userSelect      : 'none',
			cursor          : 'text',
			fontSize        : 14,
			fontWeight      : 400,
			color           : 'rgba(255, 255, 255, 0.85)',
			backgroundColor : 'rgba(0, 0, 0, 0.25)',
			padding         : theme.spacing(0.6),
			'&:hover'       :
			{
				backgroundColor : 'rgb(174, 255, 0, 0.25)'
			}
		}
	});

class VideoView extends React.PureComponent
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			videoWidth  : null,
			videoHeight : null
		};

		// Latest received video track.
		// @type {MediaStreamTrack}
		this._videoTrack = null;

		// Latest received audio track.
		// @type {MediaStreamTrack}
		this._audioTrack = null;

		// Periodic timer for showing video resolution.
		this._videoResolutionTimer = null;

		// Audio Analyzer
		this.audioAnalyzerContainer = React.createRef();

		// Periodic timer for face detection.
		this._faceDetectionTimer = null;

		this._detector = null;

		this.videoRef = React.createRef();

		this._sendFps = 1000 / config.faceDetectionTargetFps;

	}

	render()
	{
		const {
			isMe,
			isMirrored,
			isScreen,
			isExtraVideo,
			showQuality,
			showAudioAnalyzer,
			displayName,
			showPeerInfo,
			videoContain,
			advancedMode,
			videoVisible,
			hasEmotionPermission,
			videoMultiLayer,
			audioScore,
			videoScore,
			consumerCurrentSpatialLayer,
			consumerCurrentTemporalLayer,
			consumerPreferredSpatialLayer,
			consumerPreferredTemporalLayer,
			audioCodec,
			videoCodec,
			onChangeDisplayName,
			children,
			classes,
			netInfo,
			width,
			height,
			opusConfig,
			localRecordingState,
			recordingConsents,
			peer
		} = this.props;

		const {
			videoWidth,
			videoHeight
		} = this.state;

		let quality = null;

		if (showQuality)
		{
			quality = <SignalCellularOffIcon style={{ color: red[500] }}/>;

			if (videoScore || audioScore)
			{
				const score = videoScore ? videoScore : audioScore;

				switch (isMe ? score.score : score.producerScore)
				{
					case 0:
					case 1:
					{
						quality = <SignalCellular0BarIcon style={{ color: red[500] }}/>;

						break;
					}

					case 2:
					case 3:
					{
						quality = <SignalCellular1BarIcon style={{ color: red[500] }}/>;

						break;
					}

					case 4:
					case 5:
					case 6:
					{
						quality = <SignalCellular2BarIcon style={{ color: orange[500] }}/>;

						break;
					}

					case 7:
					case 8:
					case 9:
					{
						quality = <SignalCellular3BarIcon style={{ color: yellow[500] }}/>;

						break;
					}

					case 10:
					{
						quality = null;

						break;
					}

					default:
					{
						break;
					}
				}
			}
		}

		return (
			<div className={classes.root}>
				<div className={classes.info}>
					<div className={classes.media}>
						{(audioCodec || videoCodec) &&
						<div className={classnames(classes.box, 'left', { hidden: !advancedMode })}>
							{ audioCodec &&
								<React.Fragment>
									<span className={'AcodL'}>Acod: </span>
									<span className={'Acod'}>
										{audioCodec} {opusConfig}
									</span>
								</React.Fragment>
							}

							{ videoCodec &&
								<React.Fragment>
									<span className={'VcodL'}>Vcod: </span>
									<span className={'Vcod'}>
										{videoCodec}
									</span>
								</React.Fragment>
							}

							{ (videoVisible && videoWidth !== null) &&
								<React.Fragment>
									<span className={'ResL'}>Res: </span>
									<span className={'Res'}>
										{videoWidth}x{videoHeight}
									</span>
								</React.Fragment>
							}

							{ (videoVisible && width && height) &&
								<React.Fragment>
									<span className={'VPortL'}>VPort: </span>
									<span className={'VPort'}>
										{Math.round(width)}x{Math.round(height)}
									</span>
								</React.Fragment>
							}

							{ isMe && !isScreen && !isExtraVideo &&
									(netInfo.recv && netInfo.send && netInfo.send.iceSelectedTuple) &&
									<React.Fragment>
										<span className={'RecvL'}>Recv: </span>
										<span className={'RecvBps'}>
											{(netInfo.recv.sendBitrate/1024/1024).toFixed(2)}Mb/s
										</span>
										<span className={'RecvSum'}>
											{(netInfo.recv.bytesSent/1024/1024).toFixed(2)}MB
										</span>

										<span className={'SendL'}>Send: </span>
										<span className={'SendBps'}>
											{(netInfo.send.recvBitrate/1024/1024).toFixed(2)}Mb/s
										</span>
										<span className={'SendSum'}>
											{(netInfo.send.bytesReceived/1024/1024).toFixed(2)}MB
										</span>

										<span className={'IPlocL'}>IPloc: </span>
										<span className={'IPloc'}>
											{netInfo.send.iceSelectedTuple.remoteIp}
										</span>

										<span className={'IPsrvL'}>IPsrv: </span>
										<span className={'IPsrv'}>
											{netInfo.send.iceSelectedTuple.localIp}
										</span>
									</React.Fragment>
							}

							{ videoMultiLayer &&
								<React.Fragment>
									<span className={'STLcurrL'}>STLcurr: </span>
									<span className={'STLcurr'}>{consumerCurrentSpatialLayer} {consumerCurrentTemporalLayer}</span>

									<span className={'STLprefL'}>STLpref: </span>
									<span className={'STLpref'}>{consumerPreferredSpatialLayer} {consumerPreferredTemporalLayer}</span>
								</React.Fragment>
							}

						</div>
						}

						{showAudioAnalyzer && advancedMode &&
						<div
							className={classnames(classes.box, 'audioAnalyzer')}
							ref={this.audioAnalyzerContainer}
						/>
						}

						{ showQuality &&
							<div className={classnames(classes.box, 'right')}>
								{
									quality
								}
							</div>
						}

					</div>

					{ showPeerInfo &&
						<div className={classes.peer}>
							<div className={classes.box}>
								{ isMe ?
									<React.Fragment>
										<EditableInput
											value={displayName}
											propName='newDisplayName'
											className={classes.displayNameEdit}
											classLoading='loading'
											classInvalid='invalid'
											shouldBlockWhileLoading
											editProps={{
												maxLength   : 30,
												autoCorrect : 'off',
												spellCheck  : false
											}}
											onChange={
												({ newDisplayName }) =>
													onChangeDisplayName(newDisplayName)}
										/>
									</React.Fragment>
									:
									<span className={classes.displayNameStatic}>
										{
											(
												(
													localRecordingState==='start' ||
													localRecordingState==='resume'
												)&&
												(
													recordingConsents!==undefined &&
													!recordingConsents.includes(peer.id)
												)
											) ? '':displayName
										}
									</span>
								}
							</div>
						</div>
					}
				</div>

				<video
					ref={this.videoRef}
					className={classnames(classes.video, {
						hidden : (!videoVisible ||
							(
								!isMe &&
								(
									localRecordingState==='start' ||
									localRecordingState==='resume'
								)&&
								(
									recordingConsents!==undefined &&
									!recordingConsents.includes(peer.id)
								)
							)
						),
						'isMirrored' : isMirrored,
						contain      : videoContain
					})}
					autoPlay
					playsInline
					muted
					controls={false}
				/>

				{ hasEmotionPermission && <EmotionBoxes peerId={peer.id}/>}

				{children}
			</div>
		);
	}

	_extractFace(videoRef, prediction, cb)
	{
		const video = videoRef.current;

		if (!video)
		{
			logger.error('No video element found. Cannot extract face.');

			return;
		}

		logger.debug('Extracting face from video element');

		const { xMin, yMin, xMax, yMax, width, height } = prediction.box;
		const canvas = document.createElement('canvas');
		const { videoWidth, videoHeight } = video;

		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');

		ctx.drawImage(video, xMin, yMin, width, height, 0, 0, width, height);

		canvas.toBlob((blob) =>
		{
			if (blob)
			{
				const relativeBox = [ yMin/videoHeight, xMin/videoWidth,
					yMax/videoHeight, xMax/videoWidth ];

				cb({ buffer: blob, relativeBox });
			}

		}, 'image/jpeg', 1);

	}

	async _getDetector()
	{
		if (this._detector)
			return this._detector;

		const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
		const detectorConfig = {
			runtime      : 'mediapipe', // or 'tfjs'
			solutionPath : `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${faceMesh.VERSION}`
		};

		this._detector = await faceLandmarksDetection.createDetector(model,
			detectorConfig);

		return this._detector;
	}

	async _runDetection(onFace, videoRef)
	{
		const detector = await this._getDetector();

		logger.debug('detector:', detector);

		if (!detector)
		{
			logger.error('Failed to create face detector.');

			return;
		}
		this._faceDetectionTimer = setInterval(async () =>
		{
			const video = videoRef.current;

			if (video)
			{
				logger.debug('Running face detection');

				const predictions = await detector.estimateFaces(video);

				predictions.forEach((prediction) =>
				{
					this._extractFace(videoRef, prediction, onFace);
				});
			}
			else
			{
				clearInterval(this._faceDetectionTimer);
				logger.error('No video element found. Cannot run face detection.');
			}
		}, this._sendFps);
	}

	componentDidMount()
	{
		const { videoTrack, audioTrack, showAudioAnalyzer } = this.props;

		this._setTracks(videoTrack);

		// Audio analyzer
		if (showAudioAnalyzer && this.props.advancedMode)
		{
			this._setAudioMonitorTrack(audioTrack);
		}
		else if (this.audioAnalyzer)
		{
			this.audioAnalyzer.delete();
			this.audioAnalyzer = null;
		}
	}

	componentWillUnmount()
	{
		clearInterval(this._videoResolutionTimer);

		clearInterval(this._faceDetectionTimer);

		const videoElement = this.videoRef.current;

		if (videoElement)
		{
			videoElement.oncanplay = null;
			videoElement.onplay = null;
			videoElement.onpause = null;
		}

		if (this.audioAnalyzer)
		{
			this.audioAnalyzer.delete();
			this.audioAnalyzer = null;
		}
	}

	componentDidUpdate(prevProps)
	{
		if (prevProps !== this.props)
		{
			const { videoTrack, audioTrack, showAudioAnalyzer, isFaceDetecting, isMe }
				= this.props;

			this._setTracks(videoTrack);

			if (showAudioAnalyzer && this.props.advancedMode)
			{
				this._setAudioMonitorTrack(audioTrack);
			}
			else if (this.audioAnalyzer)
			{
				this.audioAnalyzer.delete();
				this.audioAnalyzer = null;
			}
			if (isMe && (prevProps.isFaceDetecting !== isFaceDetecting))
			{
				if (isFaceDetecting)
				{
					logger.debug('Starting face detection intervall');
					this._runDetection(this.props.onFace, this.videoRef);
				}
				else
				{
					logger.debug('Stopping face detection intervall');
					clearInterval(this._faceDetectionTimer);
				}
			}
		}
	}

	_setTracks(videoTrack)
	{
		if (this._videoTrack === videoTrack)
			return;

		this._videoTrack = videoTrack;

		clearInterval(this._videoResolutionTimer);
		this._hideVideoResolution();

		const videoElement = this.videoRef.current;

		if (videoTrack)
		{
			const stream = new MediaStream();

			stream.addTrack(videoTrack);

			videoElement.srcObject = stream;

			videoElement.oncanplay = () => this.setState({ videoCanPlay: true });

			videoElement.play()
				.catch((error) => logger.warn('videoElement.play() [error:"%o]', error));

			this._showVideoResolution();
		}
		else
		{
			videoElement.srcObject = null;
		}
	}

	_setAudioMonitorTrack(track)
	{
		if (!this.audioAnalyzer)
		{
			logger.debug('_setAudioMonitorTrack creating audioAnalyzer with dom:', this.audioAnalyzerContainer.current);
			this.audioAnalyzer = new AudioAnalyzer(this.audioAnalyzerContainer.current);
		}

		if (track)
		{
			this.audioAnalyzer.addTrack(track);
		}
		else
		{
			// disconnects all the tracks
			this.audioAnalyzer.removeTracks();
		}
	}

	_showVideoResolution()
	{
		this._videoResolutionTimer = setInterval(() =>
		{
			const { videoWidth, videoHeight } = this.state;
			const videoElement = this.videoRef.current;

			// Don't re-render if nothing changed.
			if (
				videoElement.videoWidth === videoWidth &&
				videoElement.videoHeight === videoHeight
			)
				return;

			this.setState(
				{
					videoWidth  : videoElement.videoWidth,
					videoHeight : videoElement.videoHeight
				});
		}, 1000);
	}

	_hideVideoResolution()
	{
		this.setState({ videoWidth: null, videoHeight: null });
	}

	handleMenuClick(event)
	{
		logger.debug('handleMenuClick', event.currentTarget);

		this.menuAnchorElement = event.currentTarget;
	}

	handleMenuClose(event)
	{
		logger.debug('handleMenuClose', event.currentTarget);

		this.menuAnchorElement = null;
	}
}

VideoView.propTypes =
{
	isMe                           : PropTypes.bool,
	isMirrored                     : PropTypes.bool,
	isScreen                       : PropTypes.bool,
	isExtraVideo   	               : PropTypes.bool,
	showQuality                    : PropTypes.bool,
	isFaceDetecting                : PropTypes.bool,
	hasEmotionPermission           : PropTypes.bool,
	showAudioAnalyzer              : PropTypes.bool,
	displayName                    : PropTypes.string,
	showPeerInfo                   : PropTypes.bool,
	videoContain                   : PropTypes.bool,
	advancedMode                   : PropTypes.bool,
	videoTrack                     : PropTypes.any,
	videoVisible                   : PropTypes.bool.isRequired,
	audioTrack                     : PropTypes.any,
	consumerSpatialLayers          : PropTypes.number,
	consumerTemporalLayers         : PropTypes.number,
	onFace                         : PropTypes.func,
	consumerCurrentSpatialLayer    : PropTypes.number,
	consumerCurrentTemporalLayer   : PropTypes.number,
	consumerPreferredSpatialLayer  : PropTypes.number,
	consumerPreferredTemporalLayer : PropTypes.number,
	videoMultiLayer                : PropTypes.bool,
	audioScore                     : PropTypes.any,
	videoScore                     : PropTypes.any,
	audioCodec                     : PropTypes.string,
	videoCodec                     : PropTypes.string,
	onChangeDisplayName            : PropTypes.func,
	children                       : PropTypes.object,
	classes                        : PropTypes.object.isRequired,
	netInfo                        : PropTypes.object,
	width                          : PropTypes.number,
	height                         : PropTypes.number,
	opusConfig                     : PropTypes.string,
	localRecordingState            : PropTypes.string,
	recordingConsents              : PropTypes.array,
	peer                           : PropTypes.object

};

export default withStyles(styles)(VideoView);
