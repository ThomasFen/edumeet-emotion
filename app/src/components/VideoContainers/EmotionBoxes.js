import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Logger from '../../Logger';
import { config } from '../../config';

export default function EmotionBoxes({
	peerId
})
{
	const canvas = useRef(null);

	const logger = useMemo(() => (new Logger('EmotionBoxes')), []);

	const currentBox = useSelector(
		(state) =>
			state.emotion.boxes[
				peerId
			]
	);

	const currentEmotion = useSelector(
		(state) =>
			state.emotion.emotions[
				peerId
			]
	);

	useEffect(() =>
	{
		logger.debug(`Current box: ${currentBox}`);

		try
		{
			requestAnimationFrame(() =>
			{
				if (canvas.current)
				{
					canvas.current.height = canvas.current.offsetHeight;
					canvas.current.width = canvas.current.offsetWidth;

					logger._debug('Canvas size:', canvas.current.width, canvas.current.height);

					const ctx = canvas.current.getContext('2d');

					if (ctx)
					{
						if (!currentBox)
						{
							ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

							return;
						}
						else if (config.localFaceDetection)
						{
							const [ topLeftY, topLeftX, bottomRightY, bottomRightX ]
								= currentBox.map((c, i) =>
								{
									return i % 2 === 0 ? c * canvas.current.height :
										c * canvas.current.width;
								});
							const [ boxWidth, boxHeight ] =
								[ bottomRightX - topLeftX, bottomRightY - topLeftY ];

							ctx.beginPath();
							ctx.textBaseline = 'top';
							ctx.font = '35pt bold arial';
							ctx.rect(topLeftX, topLeftY, boxWidth, boxHeight);
							ctx.fillStyle = 'green';
							ctx.fillText(currentEmotion.toUpperCase(), topLeftX, bottomRightY);
							ctx.strokeStyle = 'green';
							ctx.stroke();
						}
						else
						{
							const { width, height } = canvas.current;
							const longSide = Math.max(width, height);
							const shortSide = Math.min(width, height);
							const isWide = width === longSide;
							const wholePadding = longSide - shortSide;
							const sidePadding = wholePadding / 2;

							let topLeftY, bottomRightY, topLeftX, bottomRightX;

							if (isWide)
							{
								topLeftY = (canvas.current.height + wholePadding) * currentBox[0]
									- sidePadding;
								bottomRightY = (canvas.current.height + wholePadding) * currentBox[2]
									- sidePadding;
								topLeftX = canvas.current.width * currentBox[1];
								bottomRightX = canvas.current.width * currentBox[3];
							}
							else
							{
								topLeftX = (canvas.current.height + wholePadding) * currentBox[1]
									- sidePadding;
								bottomRightX = (canvas.current.height + wholePadding) * currentBox[3]
									- sidePadding;
								topLeftY = canvas.current.height * currentBox[0];
								bottomRightY = canvas.current.height * currentBox[2];
							}

							const boxWidth = bottomRightX - topLeftX;
							const boxHeight = bottomRightY - topLeftY;

							ctx.beginPath();
							ctx.textBaseline = 'top';
							ctx.font = '35pt bold arial';
							ctx.rect(topLeftX, topLeftY, boxWidth, boxHeight);
							ctx.fillStyle = 'red';
							ctx.fillText(currentEmotion.toUpperCase(), topLeftX, bottomRightY);
							ctx.strokeStyle = 'red';
							ctx.stroke();
						}

					}

				}
			});
		}
		catch (error)
		{
			logger.error('Error during drawing Face Bounding Boxes! error:%O', error);
		}
	}, [ canvas, currentBox, logger, currentEmotion ]);

	return (
		<canvas
			style={{
				position  : 'absolute',
				margin    : 'auto',
				textAlign : 'center',
				top       : 0,
				left      : 0,
				right     : 0,
				width     : '100%',
				height    : '100%'
			}}
			ref={canvas}
		/>
	);
}
