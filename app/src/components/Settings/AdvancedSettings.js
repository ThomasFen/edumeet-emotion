import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRoomContext } from '../../RoomContext';
import * as settingsActions from '../../store/actions/settingsActions';
import * as emotionActions from '../../store/actions/emotionActions';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useIntl, FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import { makePermissionSelector } from '../../store/selectors';
import { permissions } from '../../permissions';
import { config } from '../../config';

const styles = (theme) =>
	({
		setting :
		{
			padding : theme.spacing(2)
		},
		formControl :
		{
			display : 'flex'
		},
		switchLabel : {
			justifyContent : 'space-between',
			flex           : 'auto',
			display        : 'flex',
			padding        : theme.spacing(1),
			marginRight    : 0
		}
	});

const AdvancedSettings = ({
	roomClient,
	settings,
	emotionSettings,
	onToggleAdvancedMode,
	onToggleAdvancedEmotionMode,
	onToggleNotificationSounds,
	classes,
	hasEmotionPermission
}) =>
{
	const intl = useIntl();

	return (
		<React.Fragment>
			{
				hasEmotionPermission &&
				<FormControlLabel
					className={classnames(classes.setting, classes.switchLabel)}
					control={<Switch checked={emotionSettings.advancedEmotionMode} onChange={onToggleAdvancedEmotionMode} value='advancedEmotionMode' />}
					labelPlacement='start'
					label={intl.formatMessage({
						id             : 'emotionSettings.advancedEmotionMode',
						defaultMessage : 'Advanced emotion mode'
					})}
				/>
			}
			<FormControlLabel
				className={classnames(classes.setting, classes.switchLabel)}
				control={<Switch checked={settings.advancedMode} onChange={onToggleAdvancedMode} value='advancedMode' />}
				labelPlacement='start'
				label={intl.formatMessage({
					id             : 'settings.advancedMode',
					defaultMessage : 'Advanced mode'
				})}
			/>
			<FormControlLabel
				className={classnames(classes.setting, classes.switchLabel)}
				control={<Switch checked={settings.notificationSounds} onChange={onToggleNotificationSounds} value='notificationSounds' />}
				labelPlacement='start'
				label={intl.formatMessage({
					id             : 'settings.notificationSounds',
					defaultMessage : 'Notification sounds'
				})}
			/>
			{ !config.lockLastN &&
				<form className={classes.setting} autoComplete='off'>
					<FormControl className={classes.formControl}>
						<Select
							value={settings.lastN || ''}
							onChange={(event) =>
							{
								if (event.target.value)
									roomClient.changeMaxSpotlights(event.target.value);
							}}
							name='Last N'
							autoWidth
							className={classes.selectEmpty}
						>
							{ Array.from(
								{ length: config.maxLastN || 10 },
								(_, i) => i + 1
							).map((lastN) =>
							{
								return (
									<MenuItem key={lastN} value={lastN}>
										{lastN}
									</MenuItem>
								);
							})}
						</Select>
						<FormHelperText>
							<FormattedMessage
								id='settings.lastn'
								defaultMessage='Number of visible videos'
							/>
						</FormHelperText>
					</FormControl>
				</form>
			}
		</React.Fragment>
	);
};

AdvancedSettings.propTypes =
{
	roomClient                  : PropTypes.any.isRequired,
	settings                    : PropTypes.object.isRequired,
	emotionSettings             : PropTypes.object.isRequired,
	onToggleAdvancedMode        : PropTypes.func.isRequired,
	onToggleAdvancedEmotionMode : PropTypes.func.isRequired,
	onToggleNotificationSounds  : PropTypes.func.isRequired,
	hasEmotionPermission        : PropTypes.bool.isRequired,
	classes                     : PropTypes.object.isRequired
};

const makeMapStateToProps = () =>
{
	const canAnalyzeEmotions =
		makePermissionSelector(permissions.EMOTION_ANALYSIS);

	const mapStateToProps = (state) =>
		({
			settings             : state.settings,
			emotionSettings      : state.emotion.settings,
			hasEmotionPermission : canAnalyzeEmotions(state)
		});

	return mapStateToProps;
};

const mapDispatchToProps = {
	onToggleAdvancedMode        : settingsActions.toggleAdvancedMode,
	onToggleAdvancedEmotionMode : emotionActions.toggleAdvancedEmotionMode,
	onToggleNotificationSounds  : settingsActions.toggleNotificationSounds
};

export default withRoomContext(connect(
	makeMapStateToProps,
	mapDispatchToProps,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.settings === next.settings &&
				prev.emotion.settings === next.emotion.settings
			);
		}
	}
)(withStyles(styles)(AdvancedSettings)));