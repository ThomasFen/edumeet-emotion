/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-use-before-define */
import React, { useMemo, useState } from 'react';
import { timeFormat } from 'd3-time-format';
import { extent, max } from 'd3-array';
import * as allCurves from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import Logger from '../../Logger';
import { scaleTime, scaleLinear } from '@visx/scale';
import {
	AnimatedAxis
} from '@visx/react-spring';
import {
	MarkerArrow,
	MarkerLine
} from '@visx/marker';
import generateDateValue, {
	DateValue
} from '@visx/mock-data/lib/generators/genDateValue';
import { Axis, Orientation, SharedAxisProps, AxisScale } from '@visx/axis';
import { useSelector } from 'react-redux';

const tickLabelColor = '#fff';

export const labelColor = '#fff';
const axisColor = '#fff';
const strokeColor = '#338fbd';
const logger = new Logger('EmotionHistoryChart');

export const backgroundColor = '#515152';

const tickLabelProps = () =>
	({
		fill       : tickLabelColor,
		fontSize   : 10,
		fontFamily : 'sans-serif',
		textAnchor : 'middle'
	} as const);

type AxisComponentType = React.FC<
	SharedAxisProps<AxisScale> & {
		animationTrajectory: AnimationTrajectory;
	}
>;

type AnimationTrajectory = 'outside' | 'center' | 'min' | 'max' | undefined;

type CurveType = keyof typeof allCurves;

const curveTypes = Object.keys(allCurves);
// const series = new Array(lineCount).fill(null)
// 	.map((_, i) =>
// 	// vary each series value deterministically
// 		generateDateValue(25, /* seed= */ i / 72).sort(
// 			(a: DateValue, b: DateValue) => a.date.getTime() - b.date.getTime()
// 		)
// 	);
// const allData = series.reduce((rec, d) => rec.concat(d), []);
// const labels = [ 'neutral', 'happy', 'sad', 'surprise', 'fear', 'disgust', 'anger', 'contempt' ];
// const dataAndlabel = series.map((data, i) => ({ data: data, label: labels[i] }));

type EmotionTypes = 'neutral' | 'happy' | 'sad' | 'surprise' | 'fear' | 'disgust' | 'anger' | 'contempt';

type PeerEmotionHistory = {
	[emotionType in EmotionTypes]: DateValue[];
};

interface EmotionState {
	emotion: {
		emotionHistory: {
			[peerId: string]: PeerEmotionHistory;
	};
};
}

// data accessors
const getX = (d: DateValue) => d.date;
const getY = (d: DateValue) => d.value;

// // scales
// const xScale = scaleTime < number >({
// 	domain : extent(allData, getX) as [Date, Date]
// });
// const yScale = scaleLinear < number >({
// 	domain : [ 0, max(allData, getY) as number ]
// });

export type CurveProps = {
	width: number;
	height: number;
	showControls?: boolean;
};

export default function EmotionHistoryChart({
	width,
	height,
	showControls = true,
	peerId
}: CurveProps & {peerId: number})
{
	const [ curveType, setCurveType ] = useState < CurveType >('curveNatural');
	// use non-animated components if prefers-reduced-motion is set
	const prefersReducedMotionQuery =
		typeof window === 'undefined'
			? false
			: window.matchMedia('(prefers-reduced-motion: reduce)');
	const prefersReducedMotion =
		!prefersReducedMotionQuery || Boolean(prefersReducedMotionQuery.matches);
	const [ useAnimatedComponents ] = useState(
		!prefersReducedMotion
	);
	const AxisComponent: AxisComponentType = useAnimatedComponents
		? AnimatedAxis
		: Axis;
	const emotionSeries: PeerEmotionHistory = useSelector(
		(state: EmotionState) => state.emotion.emotionHistory[peerId]
	);
	const scalePadding = { left: 20, right: 90, vertical: 30 };
	const svgHeight = showControls ? height - 40 : height;
	const allData = Object.values(emotionSeries ?? [])
		.reduce((rec, d) => rec.concat(d), []);
	const xDomainMax: Date | undefined = max(allData, getX);
	// const currentTime = new Date().getTime();
	// const threeMinutesInMilliseconds = 3 * 60 * 1000;
	// const isRecent = (xDomainMax?.getTime() ?? 3) < currentTime - threeMinutesInMilliseconds;

	if (!allData.length)
	{
		return null;
	}
	const yDomainMin = new Date(xDomainMax!.getTime() - (3 * 60 * 1000));
	const lineCount = Object.keys(emotionSeries).length;
	const lineHeight = (svgHeight / lineCount) - scalePadding.vertical;
	const xScale = scaleTime < number >({
		domain : [ yDomainMin, xDomainMax ] as [Date, Date]
	});
	const yScale = scaleLinear < number >({
		domain : [ 0, 1 ]
	});
	// update scale output ranges
	const xScaleMax = width - scalePadding.right;

	xScale.range([ 0, xScaleMax ]);
	yScale.range([ lineHeight - 5, 0 ]);

	return (
		<div className='visx-curves-demo' style={{ fontSize: '12px' }}>
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
				<MarkerLine id='marker-line' fill={strokeColor} size={16} strokeWidth={1} />
				<MarkerArrow id='marker-arrow' fill={strokeColor} refX={2} size={6} />
				<rect width={width} height={svgHeight} fill={'url(#visx-axis-gradient)'} rx={14} ry={14} />
				{width > 8 &&
					Object.entries(emotionSeries).map(([ emotionType, data ], i) =>
					{
						return (
							<Group key={`lines-${i}`} top={i * (lineHeight + scalePadding.vertical)} left={scalePadding.left}>
								<LinePath<DateValue>
									curve={allCurves[curveType]}
									data={data}
									x={(d) => xScale(getX(d)) ?? 0}
									y={(d) => yScale(getY(d)) ?? 0}
									stroke={strokeColor}
									strokeWidth={1.6}
									shapeRendering='geometricPrecision'
									markerStart='url(#marker-line)'
									markerEnd='url(#marker-arrow)'
								/>
								<AxisComponent
									key={`axis-${curveType}`}
									orientation={Orientation.bottom}
									top={lineHeight}
									scale={xScale}
									tickFormat={(v: Date, j: number) =>
										(width > 400 || j % 2 === 0
											? timeFormat('%I:%M')(v)
											: 'd')
									}
									label={`${emotionType}`}
									stroke={axisColor}
									tickStroke={axisColor}
									tickLabelProps={tickLabelProps}
									numTicks={4}
									labelProps={{
										x           : xScaleMax + 6,
										y           : -5,
										fill        : labelColor,
										fontSize    : 13,
										strokeWidth : 0,
										stroke      : '#fff',
										paintOrder  : 'stroke',
										fontFamily  : 'sans-serif',
										textAnchor  : 'start'
									}}
									animationTrajectory='center'
								/>
							</Group>
						);
					})}
			</svg>
		</div>
	);
}
