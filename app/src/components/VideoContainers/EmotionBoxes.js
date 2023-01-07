import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Logger from '../../Logger';

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

	useEffect(() =>
	{
		logger.debug(`Current box: ${currentBox}`);

		try
		{
			requestAnimationFrame(() =>
			{
				if (canvas.current && currentBox)
				{
					canvas.current.height = canvas.current.offsetHeight;
					canvas.current.width = canvas.current.offsetWidth;
					const ctx = canvas.current.getContext('2d');

					if (ctx)
					{
						ctx.beginPath();
						ctx.rect(currentBox[0], currentBox[1], currentBox[2] - currentBox[0],
							currentBox[3] - currentBox[1]);
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
	}, [ canvas, currentBox, logger ]);

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
