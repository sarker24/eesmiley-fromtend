import * as React from 'react';
import TimezonePicker from './components/timezonePicker';
import * as settingsDispatch from '../../../../../redux/ducks/settings';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import RecipientsList from './components/recipientsList';
import { onSubmitForm } from 'utils/helpers';
import { Select, MenuItem, Switch } from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import { Alarm, getSettings, SettingsActions } from 'redux/ducks/settings';

import './index.scss';
import { ThunkDispatch } from 'redux-thunk';
import TextAreaInput from 'TextAreaInput';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface OwnProps {
  maxMessageLength?: number;
}

type AlarmsPanelProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class AlarmsPanel extends React.Component<AlarmsPanelProps> {
  public static defaultProps = {
    maxMessageLength: 140
  };

  updateAlarm = (key: keyof Alarm, value: unknown): void => {
    const { alarm } = this.props;
    const { save } = this.props;
    void save({ ...alarm, [key]: value });
  };

  getTimepickerHoursOptions(): React.ReactElement[] {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= 23; i++) {
      elements.push(
        <MenuItem key={i} value={i.toString()}>
          {(i < 10 ? `0${i}` : i.toString()) + ':00'}
        </MenuItem>
      );
    }

    return elements;
  }

  saveHandler = () => {
    const { save, alarm } = this.props;
    void save(alarm);
  };

  render() {
    const { intl, maxMessageLength, alarm } = this.props;

    const { zone, enabled, executionTime, message, recipients } = alarm;

    return (
      <div className='alarmsPanel'>
        <form onSubmit={onSubmitForm(this.saveHandler)}>
          <div className='field'>
            <label htmlFor='toggler'>
              <span>{intl.messages['enabled']}</span>
            </label>
            <div id='toggler' className='control'>
              <Switch
                color='primary'
                onChange={() => this.updateAlarm('enabled', !enabled)}
                checked={enabled}
              />
            </div>
            <div className='helpWrapper' />
          </div>
          <div className='field'>
            <label htmlFor='timePicker'>
              <span>{intl.messages['hourOfTheDay']}</span>
            </label>
            <div id='timePicker' className='control'>
              <Select
                value={executionTime}
                fullWidth={true}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  this.updateAlarm('executionTime', e.target.value);
                }}
              >
                {this.getTimepickerHoursOptions()}
              </Select>
            </div>
            <div className='helpWrapper' />
          </div>
          <div className='field'>
            <label htmlFor='timeZone'>
              <span>{intl.messages['timezone']}</span>
            </label>
            <div id='timeZone' className='control'>
              <TimezonePicker
                value={zone}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  this.updateAlarm('zone', e.target.value);
                }}
              />
            </div>
            <div className='helpWrapper' />
          </div>
          <div className='field' style={{ alignItems: 'flex-start', marginTop: '12px' }}>
            <label htmlFor='message'>
              <span>{intl.messages['message']}</span>
            </label>
            <div id='message' className='control'>
              <TextAreaInput
                name='message'
                maxLength={maxMessageLength}
                fullWidth={true}
                rows={5}
                rowsMax={50}
                type='text'
                placeholder={intl.messages['settings.alarms.messagePlaceholder']}
                multiline={true}
                value={message}
                onChange={(value) => this.updateAlarm('message', value)}
              />
            </div>
            <div className='helpWrapper' />
          </div>

          <div className='field' style={{ alignItems: 'flex-start', marginTop: '12px' }}>
            <label htmlFor='recipient'>
              <span>{intl.messages['recipientsMultiple']}</span>
            </label>
            <div id='recipient' className='control'>
              <RecipientsList
                value={recipients}
                onChange={(value) => {
                  this.updateAlarm('recipients', value);
                }}
              />
            </div>
            <div className='helpWrapper' />
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alarm: getSettings(state).alarms,
  isInitial: getSettings(state).isInitial
});

const mapDispatchToProps = (dispatch?: ThunkDispatch<RootState, void, SettingsActions>) => ({
  save: (data: Alarm) => dispatch(settingsDispatch.fetchAndUpdate({ alarms: data }))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AlarmsPanel));
