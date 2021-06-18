import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RootState } from 'redux/rootReducer';
import { FrequencyTarget, getSettings } from 'redux/ducks/settings';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel
} from '@material-ui/core';
import moment from 'moment';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { update as updateSettings } from 'redux/ducks/settings';
import SelectPeriodModal from 'settings/components/settings/goals/SelectPeriodModal';
import CardHeader from 'settings/components/settings/goals/CardHeader';
import { API_DATE_FORMAT } from 'utils/datetime';
import HelpText from 'helpText';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type GoalsProps = StateProps & DispatchProps & InjectedIntlProps;

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexFlow: 'column wrap'
  },
  content: {
    flexGrow: 1
  },
  dayList: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    maxWidth: '600px'
  },
  dayGroup: {
    display: 'flex',
    flexFlow: 'column wrap'
  },
  dayGroupMiddle: {
    [theme.breakpoints.down(500)]: {
      marginRight: '100%',
      order: 2
    }
  }
}));

const dayGroups = [
  [1, 2, 3],
  [4, 5],
  [6, 0]
];

const days = [1, 2, 3, 4, 5, 6, 0];
const defaultFrequency: FrequencyTarget = { days: [] };

const frequencyToDOW = (
  frequency: FrequencyTarget = defaultFrequency
): { [dow: number]: boolean } =>
  days.reduce(
    (all, current) => ({
      ...all,

      [current]: frequency.days.some((day) => day === current)
    }),
    {}
  );

const FrequencyCard: React.FunctionComponent<GoalsProps> = (props) => {
  const classes = useStyles(props);
  const { frequency, frequencyHistory, intl, updateSettings } = props;

  const [frequencyDraft, setFrequencyDraft] = React.useState(frequencyToDOW(frequency));
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const hasChanged = React.useCallback(() => {
    const freqDow = frequencyToDOW(frequency);
    return Object.keys(frequencyDraft).some((dow) => freqDow[dow] !== frequencyDraft[dow]);
  }, [frequency, frequencyDraft]);

  React.useEffect(() => {
    setFrequencyDraft(frequencyToDOW(frequency));
  }, [frequency]);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: dow } = e.target;
    setFrequencyDraft((prev) => ({ ...prev, [dow]: !prev[dow] }));
  };

  const handleUndo = () => {
    setFrequencyDraft(frequencyToDOW(frequency));
  };

  // common logic, could be extracted to an util
  const handleSave = (overridePrevious: boolean) => {
    const nextFrequency = Object.keys(frequencyDraft)
      .filter((day) => frequencyDraft[day])
      .map((day) => parseInt(day));
    if (overridePrevious) {
      const from = moment(new Date(0)).format(API_DATE_FORMAT);
      updateSettings({ expectedFrequency: [{ from, days: nextFrequency }] });
    } else {
      const from = moment().format('YYYY-MM-DD');
      updateSettings({
        expectedFrequency: [
          ...frequencyHistory.filter((slot) => slot.from !== from),
          { from, days: nextFrequency }
        ]
      });
    }
    setShowModal(false);
  };

  const handleSelectPeriod = () => {
    setShowModal(true);
  };

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <CardHeader
          title={intl.messages['benchmarks.frequencyRegistrations']}
          titleHelpIcon={
            <HelpText helpText={intl.messages['benchmarks.frequencyRegistrations.description']} />
          }
        />
        <div className={classes.dayList}>
          {dayGroups.map((days, index) => (
            <div
              key={`day_group_${index}`}
              className={classNames(classes.dayGroup, { [classes.dayGroupMiddle]: index === 1 })}
            >
              {days.map((day) => (
                <FormControlLabel
                  key={`s_day_${day}`}
                  control={
                    <Checkbox
                      color='primary'
                      name={`day-${day}`}
                      value={day}
                      checked={frequencyDraft[day]}
                      onChange={handleFrequencyChange}
                    />
                  }
                  label={moment.weekdays(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
      <CardActions>
        <Button variant='text' onClick={handleUndo} disabled={!hasChanged()}>
          {intl.messages['base.undo']}
        </Button>
        <Button
          color='primary'
          variant='contained'
          onClick={handleSelectPeriod}
          disabled={!hasChanged()}
        >
          {intl.messages['base.save']}
        </Button>
      </CardActions>
      <SelectPeriodModal
        title={intl.messages['benchmarks.frequencyRegistrations']}
        open={showModal}
        onAccept={() => {
          handleSave(true);
        }}
        onDecline={() => {
          handleSave(false);
        }}
      />
    </Card>
  );
};

const mapStateToProps = (state: RootState) => ({
  frequency: getSettings(state).currentExpectedFrequency,
  frequencyHistory: getSettings(state).expectedFrequency || []
});

const mapDispatchToProps = {
  updateSettings
};
export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FrequencyCard));
