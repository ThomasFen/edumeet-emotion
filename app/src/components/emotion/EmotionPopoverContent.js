import * as React from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { useSelector } from 'react-redux';
import { LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { SvgIcon } from '@material-ui/core';
import { ReactComponent as AngerSvg } from '../emotion/icons/svg/emotion-anger.svg';
import { ReactComponent as ContemptSvg } from '../emotion/icons/svg/emotion-contempt.svg';
import { ReactComponent as DisgustSvg } from '../emotion/icons/svg/emotion-disgust.svg';
import { ReactComponent as FearSvg } from '../emotion/icons/svg/emotion-fear.svg';
import { ReactComponent as HappySvg } from '../emotion/icons/svg/emotion-happy.svg';
import { ReactComponent as NeutralSvg } from '../emotion/icons/svg/emotion-neutral.svg';
import { ReactComponent as SadSvg } from '../emotion/icons/svg/emotion-sad.svg';
import { ReactComponent as SurpriseSvg } from '../emotion/icons/svg/emotion-surprise.svg';
import {
	EMOTION_SURPRISE_SHORT,
	EMOTION_NEUTRAL_SHORT,
	EMOTION_SAD_SHORT,
	EMOTION_FEAR_SHORT,
	EMOTION_DISGUST_SHORT,
	EMOTION_CONTEMPT_SHORT,
	EMOTION_ANGER_SHORT,
	EMOTION_HAPPY_SHORT,
	EMOTION_SURPRISE,
	EMOTION_NEUTRAL,
	EMOTION_SAD,
	EMOTION_FEAR,
	EMOTION_DISGUST,
	EMOTION_CONTEMPT,
	EMOTION_ANGER,
	EMOTION_HAPPY
} from '../../constants';

const verticalMargin = 35;

// accessors
const getEmotion = (d) => d.emotion;
const getEmotionFrequency = (d) => d.duration;
const BARCOLOR = '#338fbd';
const WHITE = '#ffffff';
const BACKGROUNDCOLOR = '#515152';

export default function EmotionPopoverContent({
	width,
	height,
	events = true,
	peerId
})
{
	// bounds
	const xMax = width;
	const yMax = height - verticalMargin;

	const peerEmotionHistory = useSelector(
		(state) =>
			state.emotion.emotionHistory[
				peerId
			]
	);

	const currentEmotion = useSelector(
		(state) =>
			state.emotion.emotions[
				peerId
			]
	);

	function sumValues(array)
	{
		return array.reduce((acc, obj) =>
		{
			acc += obj.value;

			return acc;
		}, 0);
	}

	const EmotionIcon = emotionToIcon(currentEmotion);

	// data
	const data = [
		{
			emotion  : EMOTION_ANGER_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_ANGER]) : 0
		},
		{
			emotion  : EMOTION_CONTEMPT_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_CONTEMPT]) : 0
		},
		{
			emotion  : EMOTION_DISGUST_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_DISGUST]) : 0
		},
		{
			emotion  : EMOTION_FEAR_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_FEAR]) : 0
		},
		{
			emotion  : EMOTION_HAPPY_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_HAPPY]) : 0
		},
		{
			emotion  : EMOTION_NEUTRAL_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_NEUTRAL]) : 0
		},
		{
			emotion  : EMOTION_SAD_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_SAD]) : 0
		},
		{
			emotion  : EMOTION_SURPRISE_SHORT,
			duration : peerEmotionHistory ? sumValues(peerEmotionHistory[EMOTION_SURPRISE]) : 0
		}
	];

	// var minutes = Math.floor(time / 60);
	// var seconds = time % 60;

	// scales
	const xScale =
			scaleBand({
				range   : [ 0, xMax ],
				round   : true,
				domain  : data.map(getEmotion),
				padding : 0.3
			});

	const yScale =
			scaleLinear({
				range  : [ yMax, 0 ],
				round  : true,
				domain : [ 0, Math.max(...data.map(getEmotionFrequency)) ]
			});

	//   const colorScale = scaleOrdinal<string, string>({
	//     domain: data.map(getEmotion),
	//     range: [blue, green, purple],
	//   });

	function emotionToIcon(emotion)
	{
		switch (emotion)
		{
			case EMOTION_ANGER:
				return AngerSvg;
			case EMOTION_CONTEMPT:
				return ContemptSvg;
			case EMOTION_DISGUST:
				return DisgustSvg;
			case EMOTION_FEAR:
				return FearSvg;
			case EMOTION_HAPPY:
				return HappySvg;
			case EMOTION_NEUTRAL:
				return NeutralSvg;
			case EMOTION_SAD:
				return SadSvg;
			case EMOTION_SURPRISE:
				return SurpriseSvg;
			default:
				return null;
		}
	}

	return width < 10 ? null : (
		// create a div element
		<div>
			<SvgIcon
				fontSize='large'
			>
				{EmotionIcon && <EmotionIcon/>}
			</SvgIcon>

			<svg width={width} height={height}>
				<LinearGradient
					id='visx-axis-gradient'
					from={BACKGROUNDCOLOR}
					to={BACKGROUNDCOLOR}
					toOpacity={0.7}
				/>
				<rect
					width={width}
					height={height}
					fill='url(#visx-axis-gradient)'
					rx={14}
				/>
				<Group top={verticalMargin / 2}>
					{data.map((d, i) =>
					{
						const letter = getEmotion(d);
						const barWidth = xScale.bandwidth();
						const barHeight =
						yMax - (yScale(getEmotionFrequency(d)) ?? 0);
						const barX = xScale(letter);
						const barY = yMax - barHeight;

						return (
							<Bar
								key={`bar-${letter}`}
								x={barX}
								y={barY}
								width={barWidth}
								height={barHeight}
								fill={BARCOLOR}
								onClick={() =>
								{
									if (events)
									// eslint-disable-next-line no-alert
										alert(
											`${JSON.stringify(
												Object.values(d)
											)} Seconds`
										);
								}}
							/>
						);
					})}
				</Group>
				<AxisBottom
					top={yMax + verticalMargin / 2}
					tickLength={0}
					hideTicks
					scale={xScale}
					// stroke={green}
					// tickStroke={green}
					hideAxisLine
					tickLabelProps={() => ({
						fill       : WHITE,
						fontSize   : 11,
						textAnchor : 'middle'
					})}
				/>
			</svg>
		</div>
	);
}
