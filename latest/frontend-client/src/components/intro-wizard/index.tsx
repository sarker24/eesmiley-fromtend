// TODO clean up: complex & brittle due to coupling with specific dashboard components
import * as React from 'react';
import Joyride, { CallBackProps, EVENTS, StoreHelpers, Step } from 'react-joyride';
import { connect } from 'react-redux';
import { markIntroWizardAsDisplayed, setIntroWizardStore, UiActions } from 'redux/ducks/ui';
import * as widgetDispatch from 'redux/ducks/widgets';
import { Link } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import { WidgetActions } from 'redux/ducks/widgets/types';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface IComponentState {
  show: boolean;
  steps: Step[];
  initialized: boolean;
}

type IntroWizardProps = StateProps & DispatchProps & InjectedIntlProps;

class IntroWizard extends React.Component<IntroWizardProps, IComponentState> {
  private readonly joyrideRef: React.RefObject<Joyride & { store: StoreHelpers }>;

  constructor(props: IntroWizardProps) {
    super(props);

    this.state = {
      show: false,
      initialized: false,
      steps: []
    };

    this.joyrideRef = React.createRef();
  }

  UNSAFE_componentWillReceiveProps(nextProps: IntroWizardProps) {
    if (!this.state.show && !this.state.initialized && !this.props.settingsData.isInitial) {
      if (
        (nextProps.introWizardDisplayed &&
          nextProps.introWizardDisplayed[nextProps.currentCustomerId.toString()]) ||
        (this.props.settingsData.expectedWeeklyWaste &&
          Object.keys(this.props.settingsData.expectedWeeklyWaste).length > 0) ||
        (this.props.settingsData.registrationsFrequency &&
          Object.keys(this.props.settingsData.registrationsFrequency).length > 0)
      ) {
        this.setState({
          show: false,
          initialized: true
        });
        return;
      }

      const steps = this.buildSteps();
      if (steps.length == 0) {
        this.setState(
          {
            show: false,
            initialized: true
          },
          () => {
            nextProps.setIntroWizardStore(null);
            nextProps.markIntroWizardAsDisplayed(nextProps.currentCustomerId);
          }
        );
      } else {
        this.setState(
          {
            initialized: true,
            steps: steps
          },
          () => {
            if (
              !nextProps.settingsData.registrationsFrequency ||
              !Object.keys(nextProps.settingsData.registrationsFrequency).length
            ) {
              nextProps.setEditMode('frequency-gauge', true);
            }
            if (
              !nextProps.settingsData.expectedWeeklyWaste ||
              !Object.keys(nextProps.settingsData.expectedWeeklyWaste).length
            ) {
              nextProps.setEditMode('expectedFoodWaste-gauge', true);
            }
            nextProps.setIntroWizardStore(this.joyrideRef.current.store);
            this.setState(Object.assign(this.state, { show: true }));
          }
        );
      }
    }
  }

  buildSteps = (): Step[] => {
    const steps: Step[] = [];
    const { intl, settingsData } = this.props;

    steps.push({
      content: (
        <div>
          <p>{intl.messages['dashboard.intro.frequencyMain']}</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      title: 'frequency',
      locale: {
        back: intl.messages['dashboard.intro.back'],
        next: intl.messages['skip'],
        skip: intl.messages['base.cancel'],
        last: intl.messages['dashboard.intro.done']
      },
      target: '.frequencyGaugeContainer'
    });

    steps.push({
      target: '.expectedFoodWasteGaugeContainer',
      content: (
        <div>
          <p>{intl.messages['dashboard.intro.wasteMain']}</p>
        </div>
      ),
      placement: 'top',
      isFixed: true,
      disableBeacon: true,
      title: 'waste',
      locale: {
        back: intl.messages['dashboard.intro.back'],
        next: intl.messages['skip'],
        skip: intl.messages['base.cancel'],
        last: intl.messages['dashboard.intro.done']
      }
    });

    if (settingsData.accounts && settingsData.accounts.length > 0) {
      steps.push({
        target: '.customer-select-and-clear .customerSelector',
        content: (
          <div>
            <p>{intl.messages['dashboard.intro.accountsMain']}</p>
            <p>
              <strong>{intl.messages['dashboard.intro.tip']}: </strong>
              {intl.messages['dashboard.intro.accountsTip']}
              <Link to={'/settings'}>{intl.messages['settings.settingsPage']}</Link>
            </p>
          </div>
        ),
        placement: 'top',
        disableBeacon: true,
        title: 'accounts',
        locale: {
          back: intl.messages['dashboard.intro.back'],
          next: intl.messages['skip'],
          skip: intl.messages['base.cancel'],
          last: intl.messages['dashboard.intro.done']
        }
      });
    }

    return steps;
  };

  handler = (wizard: CallBackProps) => {
    const wasteIndex = 1;
    const { index, type } = wizard;
    const {
      currentCustomerId,
      markIntroWizardAsDisplayed,
      setEditMode,
      setIntroWizardStore
    } = this.props;

    if (type === EVENTS.TOUR_END || type == EVENTS.TOOLTIP_CLOSE) {
      markIntroWizardAsDisplayed(currentCustomerId);
      setIntroWizardStore(null);
      setEditMode('frequency-gauge', false);
      setEditMode('expectedFoodWaste-gauge', false);
      this.scrollTo(0);
      return;
    }

    /*
     * FIXME: PROD-3978 Find a more "react like" way to focus input in expectedWeeklWaste
     * and to scroll to top in the last step
     */
    if (type === EVENTS.STEP_BEFORE || type == EVENTS.STEP_AFTER || type == EVENTS.TOUR_START) {
      if (index === wasteIndex) {
        setTimeout(() => {
          const element: HTMLInputElement = window.document.querySelector(
            '.expectedFoodWasteSettingsFormInner > .number-input input'
          );
          if (element) {
            element.focus();
          }
          this.forceUpdate();
        }, 100);
        this.scrollTo(
          window.document.querySelector('.expectedFoodWasteSettingsFormInner > .number-input input')
            .scrollTop
        );
      } else {
        this.scrollTo(0);
        setTimeout(() => {
          const element: HTMLInputElement = window.document.querySelector(
            '.expectedFoodWasteSettingsFormInner > .number-input input'
          );
          if (element) {
            element.blur();
          }
          this.scrollTo(0);
        }, 100);
      }
    }
  };

  scrollTo = (y: number) => {
    window.scrollTo(0, y);
    this.forceUpdate();
  };

  render() {
    const { show, steps } = this.state;

    return (
      <Joyride
        continuous
        disableOverlayClose={true}
        showProgress={true}
        scrollOffset={0}
        spotlightClicks={true}
        disableOverlay={true}
        showSkipButton={true}
        callback={this.handler}
        run={show}
        ref={this.joyrideRef}
        styles={{
          options: {
            zIndex: 1400,
            width: 480,
            primaryColor: '#009688'
          }
        }}
        steps={steps}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  settingsData: getSettings(state),
  introWizardDisplayed: state.ui.introWizardDisplayed,
  editModeFrequency:
    state.widgets.editing['frequency-gauge'] != undefined
      ? state.widgets.editing['frequency-gauge']
      : false,
  editModeWaste:
    state.widgets.editing['expectedFoodWaste-gauge'] != undefined
      ? state.widgets.editing['expectedFoodWaste-gauge']
      : false,
  currentCustomerId: state.auth.tokenPayload ? state.auth.tokenPayload.customerId : null
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<unknown, unknown, UiActions | WidgetActions>
) => ({
  markIntroWizardAsDisplayed: (accountId: number) =>
    dispatch(markIntroWizardAsDisplayed(accountId)),
  setEditMode: (id: string, editMode: boolean) =>
    dispatch(widgetDispatch.setWidgetEditMode(id, editMode)),
  setIntroWizardStore: (store: StoreHelpers) => dispatch(setIntroWizardStore(store))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(IntroWizard));
