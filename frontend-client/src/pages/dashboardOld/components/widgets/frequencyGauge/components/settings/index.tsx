import * as React from 'react';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import DialogFooter from 'components/dialogFooter';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import moment from 'moment';
import * as settingsDispatch from 'redux/ducks/settings';
import { DashboardActions, refreshRegistrationFrequency } from 'redux/ducks/dashboard';
import PreviousPeriodsOverrideDialog from '../../../previousPeriodsOverrideDialog';
import { RootState } from 'redux/rootReducer';
import { getSettings, SettingsActions } from 'redux/ducks/settings';
import { setWidgetEditMode } from 'redux/ducks/widgets';
import { ThunkDispatch } from 'redux-thunk';
import { WidgetActions } from 'redux/ducks/widgets/types';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface OwnProps {
  setEditMode: (editMode: boolean, hasSaved?: boolean, encounteredError?: boolean) => void;
}

interface IComponentState {
  frequency: { [day: number]: boolean };
  previousPeriodsDialogOpen: boolean;
}

type FrequencySettingsProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class FrequencySettings extends React.Component<FrequencySettingsProps, IComponentState> {
  constructor(props: FrequencySettingsProps) {
    super(props);

    this.state = {
      frequency: {},
      previousPeriodsDialogOpen: false
    };
  }

  componentDidMount() {
    this.reset();
  }

  reset = () => {
    const { activeRegistrationsFrequency } = this.props;
    const stateFrequency = {};
    for (const i of activeRegistrationsFrequency) {
      stateFrequency[i] = true;
    }

    this.setState({
      frequency: stateFrequency,
      previousPeriodsDialogOpen: false
    });
  };

  checkHandler = (day: number, checked: boolean) => {
    this.setState((prevState) => ({
      frequency: {
        ...prevState.frequency,
        [day]: checked
      }
    }));
  };

  introWizardHandler = () => {
    const { introWizard } = this.props;
    if (introWizard.info().index == 0) {
      introWizard.next();
    }
  };

  saveHandler = (overridePreviousPeriods: boolean) => {
    const { saveFrequency, introWizard } = this.props;
    const stateFrequency = this.state.frequency;
    const frequency: number[] = [];

    for (let i = 0; i <= 6; i++) {
      if (stateFrequency[i]) {
        frequency.push(i);
      }
    }

    this.setState({ previousPeriodsDialogOpen: false });

    if (introWizard) {
      this.introWizardHandler();
    }

    void saveFrequency(frequency, overridePreviousPeriods, Boolean(introWizard));
  };

  cancelHandler = () => {
    const { setEditMode, introWizard } = this.props;
    this.reset();

    if (introWizard) {
      this.setState({ previousPeriodsDialogOpen: false });
      this.introWizardHandler();
    } else {
      setEditMode(false);
    }
  };

  render() {
    const { frequency, previousPeriodsDialogOpen } = this.state;
    const { intl, activeRegistrationsFrequency } = this.props;

    const days = [1, 2, 3, 4, 5];
    const weekendDays = [6, 0];

    return (
      <div className='containerContentInner'>
        <div className='settingsContainer'>
          <div className='settingsWrapperRow'>
            <div className='settingsWrapper'>
              {days.map((day, i) => {
                return (
                  <div key={i} className='settingsItem'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color='primary'
                          name={`day-${i}`}
                          className='setBox'
                          checked={frequency.hasOwnProperty(day) ? frequency[day] : false}
                          onChange={(e, checked: boolean) => this.checkHandler(day, checked)}
                        />
                      }
                      label={moment.weekdays(day)}
                    />
                  </div>
                );
              })}
            </div>
            <div className='settingsWrapper'>
              {weekendDays.map((day, i) => {
                return (
                  <div key={i} className='settingsItem'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color='primary'
                          name={`day-w-${i}`}
                          className='setBox'
                          checked={frequency.hasOwnProperty(day) ? frequency[day] : false}
                          onChange={(e, checked: boolean) => this.checkHandler(day, checked)}
                        />
                      }
                      label={moment.weekdays(day)}
                    />
                  </div>
                );
              })}
              {[1, 2, 3].map((day, i) => {
                return <div key={i} className='settingsItem' />;
              })}
            </div>
          </div>
        </div>
        <DialogFooter
          onCancel={this.cancelHandler}
          onSave={() => {
            if (Object.keys(activeRegistrationsFrequency).length == 0) {
              this.saveHandler(true);
            } else {
              this.setState({ previousPeriodsDialogOpen: true });
            }
          }}
        />
        <PreviousPeriodsOverrideDialog
          title={intl.messages['benchmarks.frequencyRegistrations']}
          open={previousPeriodsDialogOpen}
          onAccept={() => {
            this.saveHandler(true);
          }}
          onDecline={() => {
            this.saveHandler(false);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  activeRegistrationsFrequency: getSettings(state).activeRegistrationsFrequency,
  introWizard: state.ui.introWizard && state.ui.introWizard.next ? state.ui.introWizard : null
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, SettingsActions | DashboardActions | WidgetActions>
) => {
  return {
    saveFrequency: async (
      frequency: number[],
      overridePreviousPeriods: boolean,
      introWizardOn: boolean
    ) => {
      await dispatch(
        settingsDispatch.fetchAndUpdate({}, (newData) => {
          let registrationsFrequency =
            newData.registrationsFrequency != null ? newData.registrationsFrequency : {};
          if (!overridePreviousPeriods) {
            registrationsFrequency = {
              ...registrationsFrequency,
              [moment().format('YYYY-MM-DD')]: frequency
            };
          } else {
            registrationsFrequency = {
              [0]: frequency
            };
          }
          return { ...newData, registrationsFrequency };
        })
      );

      await dispatch(refreshRegistrationFrequency());
      !introWizardOn && dispatch(setWidgetEditMode('frequency-gauge', false));
    }
  };
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FrequencySettings));
