// eslint-disable-next-line no-use-before-define
import React, { useState } from 'react';
import { max } from 'd3-array';
import * as allCurves from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import {
	MarkerArrow,
	MarkerCross
} from '@visx/marker';
import { Axis, Orientation } from '@visx/axis';
import { useSelector } from 'react-redux';

const timeWindow = 3 * 60 * 1000;
const labelColor = '#fff';
const axisColor = '#fff';
const strokeColor = '#338fbd';
const curveTypes = Object.keys(allCurves);
const tickLabelColor = '#fff';

export const backgroundColor = '#515152';

const tickLabelProps = () =>
	({
		fill       : tickLabelColor,
		fontSize   : 11,
		fontFamily : 'sans-serif',
		textAnchor : 'middle'
	} as const);

export interface DateValue {
	date: Date;
	value: number;
	}
type CurveType = keyof typeof allCurves;
type EmotionTypes = 'neutral' | 'happy' | 'sad' | 'surprise' | 'fear' | 'disgust' | 'anger' | 'contempt';
type PeerEmotionHistory = {
	[emotionType in EmotionTypes]: DateValue[];
};

interface EmotionState {
	emotion: {
		emotions: {
			[peerId: string]: EmotionTypes;
		};
		emotionHistory: {
			[peerId: string]: PeerEmotionHistory;
	};
};
}

// data accessors
const getX = (d: DateValue) => d.date;
const getY = (d: DateValue) => d.value;

export type CurveProps = {
	width: number;
	height: number;
	showControls?: boolean;
};

function binarySearch(arr: DateValue[], date: Date)
{
	let left = 0;
	let right = arr.length - 1;

	while (left <= right)
	{
		const mid = Math.floor((left + right) / 2);

		if (arr[mid].date < date)
		{
			left = mid + 1;
		}
		else
		{
			right = mid - 1;
		}
	}

	return left;
}

export default function EmotionHistoryChart({
	width,
	height,
	showControls = true,
	peerId
}: CurveProps & {peerId: number})
{
	const [ curveType, setCurveType ] = useState < CurveType >('curveNatural');
	// use non-animated components if prefers-reduced-motion is set
	const emotionSeries: PeerEmotionHistory = useSelector(
		(state: EmotionState) => state.emotion.emotionHistory[peerId]
	);
	const currentEmotion = useSelector(
		(state: EmotionState) =>
			state.emotion.emotions[
				peerId
			]
	);
	const scalePadding = { left: 20, right: 90, vertical: 30 };
	const svgHeight = showControls ? height - 40 : height;
	const allData = Object.values(emotionSeries ?? [])
		.reduce((rec, d) => rec.concat(d), []);
	const xDomainMax: Date | undefined = max(allData, getX);

	if (!allData.length || !currentEmotion)
	{
		return null;
	}
	const xDomainMin = new Date(xDomainMax!.getTime() - (timeWindow));
	const lineCount = Object.keys(emotionSeries).length;
	const lineHeight = (svgHeight / lineCount) - scalePadding.vertical;
	const xScale = scaleTime < number >({
		domain : [ xDomainMin, xDomainMax ] as [Date, Date]
	});
	const yScale = scaleLinear < number >({
		domain : [ 0, 1 ]
	});
	// update scale output ranges
	const xScaleMax = width - scalePadding.right;

	xScale.range([ 0, xScaleMax ]);
	yScale.range([ lineHeight - 5, 0 ]);

	return (
		<div className='emotionHistoryChart' style={{ fontSize: '12px' }}>
			{showControls && (
				<>
					<label>
						Curve type &nbsp;
						<select
							onChange={(e) => setCurveType(e.target.value as CurveType)}
							value={curveType}
						>
							{curveTypes.map((curve) => (
								<option key={curve} value={curve}>
									{curve}
								</option>
							))}
						</select>
					</label>
					&nbsp;
					<br />
				</>
			)}
			<svg width={width} height={svgHeight}>
				<LinearGradient
					id='visx-axis-gradient'
					from={backgroundColor}
					to={backgroundColor}
					toOpacity={0.7}
				/>
				<MarkerArrow id='marker-arrow' fill={strokeColor} refX={2} size={6} />
				<MarkerCross
					id='marker-cross'
					stroke={strokeColor}
					size={16}
					strokeWidth={2}
					strokeOpacity={0.6}
					markerUnits='userSpaceOnUse'
				/>
				<rect width={width} height={svgHeight} fill={'url(#visx-axis-gradient)'} rx={14} ry={14} />
				{width > 8 &&
					Object.entries(emotionSeries).map(([ emotionType, data ], i) =>
					{
						const cutOffIndex = binarySearch(data, xDomainMin);
						const timeWindowData = data.slice(cutOffIndex);

						return (
							<Group key={`lines-${i}`} top={i * (lineHeight + scalePadding.vertical)} left={scalePadding.left}>
								<LinePath<DateValue>
									curve={allCurves[curveType]}
									data={timeWindowData}
									x={(d) => xScale(getX(d)) ?? 0}
									y={(d) => yScale(getY(d)) ?? 0}
									stroke={strokeColor}
									strokeWidth={1.6}
									shapeRendering='geometricPrecision'
									markerStart='url(#marker-cross)'
									markerEnd='url(#marker-arrow)'
								/>
								<Axis
									orientation={Orientation.bottom}
									top={lineHeight}
									scale={xScale}
									label={`${emotionType}`}
									stroke={axisColor}
									strokeWidth={0.5}
									tickStroke={axisColor}
									tickLabelProps={tickLabelProps}
									numTicks={4}
									labelProps={{
										x           : xScaleMax + 10,
										y           : -5,
										fill        : labelColor,
										fontSize    : 13,
										strokeWidth : 0,
										stroke      : '#fff',
										paintOrder  : 'stroke',
										fontFamily  : 'sans-serif',
										textAnchor  : 'start'
									}}
								/>
							</Group>
						);
					})}
			</svg>
		</div>
	);
}
