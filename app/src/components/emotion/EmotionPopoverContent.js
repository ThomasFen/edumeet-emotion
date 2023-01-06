import * as React from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { useSelector } from 'react-redux';
import { RadialGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
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
const BARCOLOR = '#a9b8cf';
const WHITE = '#ffffff';

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

	// data
	const data = [
		{
			emotion  : EMOTION_ANGER_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_ANGER].length : 0
		},
		{
			emotion  : EMOTION_CONTEMPT_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_CONTEMPT].length : 0
		},
		{
			emotion  : EMOTION_DISGUST_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_DISGUST].length : 0
		},
		{
			emotion  : EMOTION_FEAR_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_FEAR].length : 0
		},
		{
			emotion  : EMOTION_HAPPY_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_HAPPY].length : 0
		},
		{
			emotion  : EMOTION_NEUTRAL_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_NEUTRAL].length : 0
		},
		{
			emotion  : EMOTION_SAD_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_SAD].length : 0
		},
		{
			emotion  : EMOTION_SURPRISE_SHORT,
			duration : peerEmotionHistory ? peerEmotionHistory[EMOTION_SURPRISE].length : 0
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

	return width < 10 ? null : (
		<svg width={width} height={height}>
			<RadialGradient
				id={'jitsiBlue'}
				from='#3f6296'
				to='#122c52'
				r='60%'
			/>
			<rect
				width={width}
				height={height}
				fill='url(#jitsiBlue)'
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
	);
}
