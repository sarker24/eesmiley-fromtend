import * as React from 'react';
import { Select, Button, MenuItem, TextField, Theme } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import HelpText from 'components/helpText';
import moment from 'moment';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { onSubmitForm } from 'utils/helpers';
import ProjectRegistrationPoints from '../projectRegistrationPoints';
import { makeStyles } from '@material-ui/styles';
import { DurationType, Project, ProjectDuration } from 'redux/ducks/projects';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';

interface OwnProps {
  registrationPoints: RegistrationPoint[];
  createProject: (project: Partial<Project>) => Promise<Project>;
  closeModal: () => void;
  showNotification: (message: string, isError: boolean) => void;
  update: () => void;
}

type CreateProjectProps = InjectedIntlProps & OwnProps;

const useStyles = makeStyles((theme: Theme) => ({
  inputGroup: {
    '& > * + *': {
      marginLeft: theme.spacing(2)
    }
  }
}));

const CreateProject: React.FunctionComponent<CreateProjectProps> = (props) => {
  const classes = useStyles(props);
  const { registrationPoints, intl, createProject, closeModal, showNotification, update } = props;

  const [selectedRegistrationPoints, setRegistrationPoints] = React.useState([]);
  const [duration, setDuration] = React.useState<ProjectDuration>({
    type: 'CALENDAR',
    end: undefined,
    start: undefined,
    days: undefined
  });
  const [name, setName] = React.useState<string>('');

  const handleRegistrationPointChange = (event, index, values) => {
    setRegistrationPoints(values);
  };

  const handleDurationPayload = (payload: ProjectDuration) => {
    if (
      payload.start &&
      payload.end &&
      moment.unix(payload.end).diff(moment.unix(payload.start), 'days') < 1
    ) {
      payload.end = moment.unix(payload.start).endOf('day').unix();
    }

    setDuration((prev) => ({ ...prev, ...payload }));
  };

  const validateSubmit = () => {
    if (name && selectedRegistrationPoints && duration.start && (duration.end || duration.days)) {
      const newProject = {
        name,
        duration,
        registrationPoints: selectedRegistrationPoints
      };
      void createProject(newProject).then(() => {
        closeModal();
        update();
      });
    } else {
      showNotification(intl.messages['generic.input.allRequiredError'], true);
    }
  };

  /*
   * Handles selection changes in MT (https://material-table.com/#/docs/all-props)
   * */
  const onSelectionChange = (rows) => {
    handleRegistrationPointChange(null, null, rows);
  };

  return (
    <form
      onSubmit={onSubmitForm(validateSubmit)}
      className='projectActionsPanel projectActionsPanelInModal'
    >
      <div className='projectName'>
        <TextField
          required={true}
          autoFocus={true}
          value={name}
          label={intl.messages['project.name']}
          type='text'
          name='panel1_nameInput'
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className='projectSelections'>
        <ProjectRegistrationPoints
          key={'new-project'}
          registrationPoints={registrationPoints}
          projectRegistrationPoints={selectedRegistrationPoints}
          onSelectionChange={onSelectionChange}
        />
      </div>
      <div className='projectDuration'>
        <div className='durationSelections'>
          <HelpText visible={true} helpText={intl.messages['help.project.duration']}>
            <Select
              label={intl.messages['project.dialog.durationLabel']}
              value={duration.type}
              required={true}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                handleDurationPayload({
                  start: duration.start,
                  end: duration.end,
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
        <div className='durationValues'>
          <small>{intl.messages['project.dialog.durationLabel']}</small>
          {duration.type === 'CALENDAR' ? (
            <div className={classes.inputGroup}>
              <DatePicker
                format={'L'}
                label={intl.messages['project.dialog.duration.startDate']}
                value={duration.start ? moment.unix(duration.start).toDate() : null}
                className='datePickerStartDate'
                required={true}
                id={'datePickerStartDateProject'}
                onChange={(date: any) => {
                  handleDurationPayload({
                    start: moment(date).unix(),
                    end: duration.end,
                    type: duration.type
                  });
                }}
              />
              <DatePicker
                format={'L'}
                label={intl.messages['project.dialog.duration.endDate']}
                disabled={!duration.start}
                minDate={duration.start ? moment.unix(duration.start).toDate() : null}
                value={duration.end ? moment.unix(duration.end).toDate() : null}
                className='datePickerEndDate'
                required={true}
                id={'datePickerEndDateProject'}
                onChange={(date: any) => {
                  handleDurationPayload({
                    start: duration.start,
                    end: moment(date).unix(),
                    type: duration.type
                  });
                }}
              />
            </div>
          ) : (
            <div className={classes.inputGroup}>
              <DatePicker
                format={'L'}
                label={intl.messages['project.dialog.duration.startDate']}
                id={'datePickerStartDateDurationProject'}
                //placeholder={intl.messages['project.dialog.duration.startDate']}
                value={duration.start ? moment.unix(duration.start).toDate() : null}
                className='datePickerStartDate'
                required={true}
                onChange={(date: any) => {
                  handleDurationPayload({
                    start: moment(date).unix(),
                    end: duration.end,
                    type: duration.type,
                    days: duration.hasOwnProperty('days') ? duration.days : null
                  });
                }}
              />
              <TextField
                required={true}
                value={duration.days}
                label={intl.messages['project.dialog.duration.days']}
                type='number'
                inputProps={{ min: 1 }}
                name='panel1_durationInput'
                onChange={(e) => {
                  handleDurationPayload({
                    start: duration.start,
                    days: e.target.value !== '' ? parseInt(e.target.value) : undefined,
                    end: duration.end,
                    type: duration.type
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className='editModalControllers'>
        <Button onClick={closeModal}>{intl.messages['base.cancel']}</Button>
        <Button variant='contained' color='primary' type='submit'>
          {intl.messages['base.save']}
        </Button>
      </div>
    </form>
  );
};

export default injectIntl(CreateProject);
