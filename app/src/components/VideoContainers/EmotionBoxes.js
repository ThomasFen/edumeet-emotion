import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Logger from '../../Logger';

export default function EmotionBoxes({
	peerId
})
{
	const canvas = useRef(null);

	const logger = useMemo(() => (new Logger('EmotionBoxes')), []);

	const currentEmotion = useSelector(
		(state) =>
			state.emotion.emotions[
				peerId
			]
	);

	useEffect(() =>
	{
		logger.debug(`Current emotion: ${currentEmotion}`);

		try
		{
			requestAnimationFrame(() =>
			{
				if (canvas.current)
				{
					canvas.current.height = canvas.current.offsetHeight;
					canvas.current.width = canvas.current.offsetWidth;
					const ctx = canvas.current.getContext('2d');

					if (ctx)
					{
						ctx.beginPath();
						ctx.rect(0, 0, 50, 50);
						ctx.strokeStyle = 'red';
						ctx.stroke();
					}

				}
			});
		}
		catch (error)
		{
			logger.error('Error during drawing Face Bounding Boxes! error:%O', error);
		}
	}, [ canvas, currentEmotion, logger ]);

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
				height    : '100%'			}}
			ref={canvas}
		/>
	);
}
