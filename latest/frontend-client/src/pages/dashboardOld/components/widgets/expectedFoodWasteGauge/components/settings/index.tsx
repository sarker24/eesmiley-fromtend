import * as React from 'react';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import moment from 'moment';
import * as settingsDispatch from 'redux/ducks/settings';
import { onSubmitForm } from 'utils/helpers';
import NumberInput from 'input/number';
import { refreshExpectedWeeklyWaste, refreshImprovements } from 'redux/ducks/dashboard';
import DialogFooter from 'components/dialogFooter';
import PreviousPeriodsOverrideDialog from '../../../previousPeriodsOverrideDialog';
import { convertMassToViewValue, convertViewValueToMass } from 'utils/number-format';
import { NumberFormatValues } from 'react-number-format';
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
  expectedWeeklyWaste: number;
  inputExpectedWeeklyWaste: string;
  previousPeriodsDialogOpen: boolean;
}

type ExpectedFoodWasteSettingsProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class ExpectedFoodWasteSettings extends React.Component<
  ExpectedFoodWasteSettingsProps,
  IComponentState
> {
  constructor(props: ExpectedFoodWasteSettingsProps) {
    super(props);

    this.state = {
      expectedWeeklyWaste: null,
      previousPeriodsDialogOpen: false,
      inputExpectedWeeklyWaste: null
    };
  }

  componentDidMount() {
    this.reset();
  }

  reset = () => {
    const { activeExpectedWeeklyWaste } = this.props;
    this.setState({
      expectedWeeklyWaste: convertMassToViewValue(activeExpectedWeeklyWaste),
      inputExpectedWeeklyWaste:
        activeExpectedWeeklyWaste != 0
          ? convertMassToViewValue(activeExpectedWeeklyWaste).toString()
          : null
    });
  };

  introWizardHandler = () => {
    const { introWizard } = this.props;
    if (introWizard.info().index == 1) {
      introWizard.next();
    }
  };

  saveHandler = (overridePreviousPeriods: boolean) => {
    const { saveExpectedWeeklyWaste, introWizard } = this.props;
    this.setState({ previousPeriodsDialogOpen: false });

    if (introWizard) {
      this.introWizardHandler();
    }
    // never throws error due to error handlers in action creators
    void saveExpectedWeeklyWaste(
      this.state.expectedWeeklyWaste,
      overridePreviousPeriods,
      !!introWizard
    );
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

  onValueChange = (values: NumberFormatValues) => {
    const { floatValue, value } = values;

    this.setState({
      expectedWeeklyWaste: floatValue,
      inputExpectedWeeklyWaste: value
    });
  };

  render() {
    const { unit, intl, activeExpectedWeeklyWaste } = this.props;
    const { previousPeriodsDialogOpen, inputExpectedWeeklyWaste, expectedWeeklyWaste } = this.state;

    return (
      <div className='containerContentInner'>
        <form
          onSubmit={onSubmitForm(() => {
            if (!activeExpectedWeeklyWaste) {
              this.saveHandler(true);
            } else {
              this.setState({ previousPeriodsDialogOpen: true });
            }
          })}
        >
          <div className='expectedFoodWasteSettingsFormInner'>
            <NumberInput
              autoFocus={!this.props.introWizard}
              className={'number-input'}
              value={expectedWeeklyWaste}
              required={true}
              suffix={` ${unit}`}
              onValueChange={this.onValueChange}
              allowNegative={false}
            />
          </div>
          <DialogFooter
            disabledSave={!inputExpectedWeeklyWaste || inputExpectedWeeklyWaste === ''}
            onCancel={this.cancelHandler}
            onSave={() => {
              if (!activeExpectedWeeklyWaste) {
                this.saveHandler(true);
              } else {
                this.setState({ previousPeriodsDialogOpen: true });
              }
            }}
          />
          <PreviousPeriodsOverrideDialog
            title={intl.messages['food_waste']}
            open={previousPeriodsDialogOpen}
            onAccept={() => this.saveHandler(true)}
            onDecline={() => this.saveHandler(false)}
          />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  unit: getSettings(state).unit,
  activeExpectedWeeklyWaste: getSettings(state).activeExpectedWeeklyWaste,
  introWizard: state.ui.introWizard && state.ui.introWizard.next ? state.ui.introWizard : null
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, SettingsActions | WidgetActions>
) => ({
  saveExpectedWeeklyWaste: async (
    activeExpectedWeeklyWaste: number,
    overridePreviousPeriods: boolean,
    introWizardOn: boolean
  ) => {
    await dispatch(
      settingsDispatch.fetchAndUpdate({}, (newData) => {
        let expectedWeeklyWaste =
          newData.expectedWeeklyWaste != null ? newData.expectedWeeklyWaste : {};

        if (!overridePreviousPeriods) {
          expectedWeeklyWaste = {
            ...expectedWeeklyWaste,
            [moment().format('YYYY-MM-DD')]: convertViewValueToMass(activeExpectedWeeklyWaste)
          };
        } else {
          expectedWeeklyWaste = {
            [0]: convertViewValueToMass(activeExpectedWeeklyWaste)
          };
        }
        return { ...newData, expectedWeeklyWaste };
      })
    );
    await dispatch(refreshImprovements());
    await dispatch(refreshExpectedWeeklyWaste());
    !introWizardOn && dispatch(setWidgetEditMode('expectedFoodWaste-gauge', false));
  }
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ExpectedFoodWasteSettings));
