import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import EmotionPopoverContent from '../emotion/EmotionPopoverContent';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Fab from '@material-ui/core/Fab';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import CancelIcon from '@material-ui/icons/Cancel';

const useStyles = makeStyles((theme) => ({
	container : {
		display  : 'flex',
		flexWrap : 'wrap'
	},
	formControl : {
		margin   : theme.spacing(1),
		minWidth : 120
	}
}));

export default function EmotionFab({ hasEmotionPermission,
	emotionAnalysisState, roomClient, peerId, controls, classnames,
	classesPopover })
{
	const classes = useStyles();
	const [ open, setOpen ] = React.useState(false);
	const [ anchorEl, setAnchorEl ] = React.useState(null);
	const popOverOpen = Boolean(anchorEl);
	const [ worker, setWorker ] = React.useState('bento');
	const [ localFaceDetection, setLocalFaceDetection ] = React.useState(false);
	const intl = useIntl();
	const advancedEmotionMode = useSelector(
		(state) =>
			state.emotion.settings.advancedEmotionMode
	);
	const handleLocalFaceDetection = (event) =>
	{
		setLocalFaceDetection(event.target.value);
	};

	const handleWorker = (event) =>
	{
		setWorker(event.target.value);
	};

	const handleFabClick = () =>
	{
		if (emotionAnalysisState === 'active')
			roomClient.emotionStopAnalysis({ peerId, localFaceDetection });
		else
		if (advancedEmotionMode) { setOpen(true); }
		else
			roomClient.emotionStartAnalysis({ peerId });
	};

	const handleDialogOk = () =>
	{
		setOpen(false);
		roomClient.emotionStartAnalysis({ peerId, localFaceDetection });
	};

	const handleClose = () =>
	{
		setOpen(false);
	};

	const emotionPopupOpen = (event) =>
	{
		setAnchorEl(event.currentTarget);
	};

	const emotionPopupClose = () =>
	{
		setAnchorEl(null);

	};

	return (
		<div>
			<Fab
				aria-label={intl.formatMessage({
					id             : 'emotion.startAnalysis',
					defaultMessage : 'Activate emotion analysis'
				})}
				style={{ ...controls.item.style }}
				disabled={!hasEmotionPermission}
				className={classnames('fab')}
				color={emotionAnalysisState === 'active' ?
					'secondary'
					: 'default'
				}
				size={controls.item.size}
				onMouseEnter={emotionPopupOpen}
				onMouseLeave={emotionPopupClose}
				aria-haspopup='true'
				aria-owns={popOverOpen ? 'mouse-over-popover' : undefined}
				onClick={handleFabClick}
			>
				{emotionAnalysisState === 'active' ?
					<CancelIcon />
					:
					<EmojiEmotionsIcon />
				}
			</Fab>
			{emotionAnalysisState === 'active' &&
				<Popover
					id='mouse-over-popover'
					open={popOverOpen}
					className={classesPopover.popover}
					disableRestoreFocus
					anchorEl={anchorEl}
					classes={{
						paper : classesPopover.paper
					}}
					onClose={emotionPopupClose}
					anchorOrigin={{
						vertical   : 'top',
						horizontal : 'right'
					}}
					transformOrigin={{
						vertical   : 'bottom',
						horizontal : 'right'
					}}
				>
					<EmotionPopoverContent
						width={240}
						height={120}
						peerId={peerId}
					/>
				</Popover>
			}
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Emotion Settings</DialogTitle>
				<DialogContent>
					<form className={classes.container}>
						<FormControl style={{ minWidth: 140 }} className={classes.formControl} >
							<InputLabel htmlFor='demo-dialog '>Face Detection</InputLabel>
							<Select
								value={localFaceDetection}
								onChange={handleLocalFaceDetection}
								input={<Input id='demo-dialog ' />}
							>
								<MenuItem value>Client-side</MenuItem>
								<MenuItem value={false}>Server-side</MenuItem>
							</Select>
						</FormControl>
						<FormControl className={classes.formControl} >
							<InputLabel id='demo-dialog-select-label' >Worker</InputLabel>
							<Select
								labelId='demo-dialog-select-label'
								id='demo-dialog-select'
								value={worker}
								onChange={handleWorker}
								input={<Input />}
							>
								<MenuItem value={'bento'}>BentoML</MenuItem>
								<MenuItem value={'redis'}>Redis</MenuItem>
								<MenuItem value={'celery'}>Celery</MenuItem>
							</Select>
						</FormControl>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='primary'>
						Cancel
					</Button>
					<Button onClick={handleDialogOk} color='primary'>
						Ok
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}