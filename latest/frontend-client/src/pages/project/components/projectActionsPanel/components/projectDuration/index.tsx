import * as React from 'react';
import moment from 'moment';
import HelpText from 'components/helpText';
import { TextField, MenuItem, Select, Theme } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { DurationType, ProjectDuration as ProjectDurationType } from 'redux/ducks/projects';

interface OwnProps {
  duration: ProjectDurationType;
  minDate?: Date;
  handleChange: (duration: ProjectDurationType) => void;
  isDurationTypeDisabled: boolean;
}

type ProjectDurationProps = InjectedIntlProps & OwnProps;

const useStyles = makeStyles((theme: Theme) => ({
  inputGroup: {
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(2)
    }
  }
}));

const ProjectDuration: React.FunctionComponent<ProjectDurationProps> = (props) => {
  const classes = useStyles(props);
  const { duration, intl, handleChange, minDate, isDurationTypeDisabled } = props;

  const returnCalendarFields = () => (
    <div className={classes.inputGroup}>
      <DatePicker
        format={'L'}
        label={intl.messages['project.dialog.duration.startDate']}
        required={true}
        minDate={moment(minDate)}
        value={duration.start ? moment.unix(duration.start) : null}
        onChange={(date: any) => {
          handleChange({
            start: moment(date).startOf('day').unix(),
            end: duration.end,
            type: duration.type
          });
        }}
      />
      <DatePicker
        format={'L'}
        label={intl.messages['project.dialog.duration.endDate']}
        required={true}
        minDate={duration.start ? moment.unix(duration.start).add(1, 'days') : null}
        disabled={!duration.start}
        value={duration.end ? moment.unix(duration.end) : null}
        onChange={(date: any) => {
          handleChange({
            start: duration.start,
            end: moment(date).endOf('day').unix(),
            type: duration.type
          });
        }}
      />
    </div>
  );

  const returnRegistrationFields = () => (
    <div className={classes.inputGroup}>
      <DatePicker
        format={'L'}
        label={intl.messages['project.dialog.duration.startDate']}
        required={true}
        minDate={moment(minDate)}
        value={duration.start ? moment.unix(duration.start) : null}
        onChange={(date: any) => {
          handleChange({
            start: moment(date).startOf('day').unix(),
            end: duration.end,
            days: duration.days,
            type: duration.type
          });
        }}
      />
      <TextField
        required={true}
        label={intl.messages['project.dialog.duration.days']}
        value={duration.days}
        type='number'
        name='panel1_durationInput'
        inputProps={{ min: 1 }}
        onChange={(e) => {
          handleChange({
            start: duration.start,
            days: e.target.value !== '' ? parseInt(e.target.value) : undefined,
            end: duration.end,
            type: duration.type
          });
        }}
      />
    </div>
  );

  return (
    <div>
      <div className='durationSelections'>
        <HelpText visible={true} helpText={intl.messages['help.project.duration']}>
          <Select
            label={intl.messages['project.dialog.durationLabel']}
            value={duration.type}
            required={true}
            disabled={isDurationTypeDisabled}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange({
                start: duration.start,
                end: duration.end,
                days: duration.days,
                type: event.target.value as DurationType
              });
            }}
          >
            <MenuItem value='CALENDAR'>{intl.messages['date']}</MenuItem>
            <MenuItem value='REGISTRATIONS'>
              {intl.messages['project.dialog.duration.days']}
            </MenuItem>
          </Select>
        </HelpText>
      </div>
      {duration.type === 'CALENDAR' ? returnCalendarFields() : returnRegistrationFields()}
    </div>
  );
};

export default injectIntl(ProjectDuration);
