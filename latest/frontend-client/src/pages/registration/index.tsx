import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as registrationDispatch from 'redux/ducks/registration';
import { AuthActions, logout } from 'redux/ducks/auth';
import { clearSelectorItems, UiActions } from 'redux/ducks/ui';
import './index.scss';
import Register from './Register';
import RegistrationPointSelection from './RegistrationPointSelection';
import { default as NodeHistory } from './History';
import { default as GuestRegistrationHistory } from './GuestRegistrationHistory';

import Helmet from 'react-helmet';
import * as React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import * as notificationDispatch from 'redux/ducks/notification';
import * as settingsDispatch from '../../redux/ducks/settings';
import { Icon } from 'components/icon';
import { browserHistory } from 'react-router';
import { findTree, getRegistrationPoints } from 'redux/ducks/data/registrationPoints';
import { Slide, Button, Grid, Step, Stepper, StepButton } from '@material-ui/core';
import GuestRegistration from './GuestRegistration';
import { ConnectionType, RegistrationActions, ScaleStatus } from 'redux/ducks/registration';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { SettingsActions } from 'redux/ducks/settings';
import { NotificationActions } from 'redux/ducks/notification';
import logoutImage from 'static/icons/logout.svg';
import RegistrationSuccessModal from 'registration/RegistrationSuccessModal';
import GuestRegistrationSuccessModal from 'registration/GuestRegistrationSuccessModal';

const StepConnector = () => <ChevronRightIcon />;

const COMPONENTS_BY_STEP = {
  0: RegistrationPointSelection,
  1: Register,
  2: GuestRegistration
};

export interface RegistrationPageProps {
  guestRegistrationOnly?: boolean;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
export type OwnProps = StateProps & DispatchProps & InjectedIntlProps & RegistrationPageProps;

type OldConnectionMessage = {
  isScaleConnected: boolean;
};

type NewConnectionMessage = ScaleStatus;

type IScaleConnectionMessage = OldConnectionMessage | NewConnectionMessage;

interface IScaleWeightMessage {
  isMessage: boolean;
  message: string | null;
  weight: number | null;
  unit: string;
  isStable: boolean;
  isLowVoltage: boolean;
  connectionType: ConnectionType;
}

function isNewConnectionMessage(data: IScaleConnectionMessage): data is NewConnectionMessage {
  return (data as NewConnectionMessage).isConnected !== undefined;
}

/**
 * Type guard that guarantees the correct type IScaleConnectionMessage
 *
 * @public
 */
function isIScaleConnectionMessage(
  data: IScaleConnectionMessage | IScaleWeightMessage
): data is IScaleConnectionMessage {
  return (
    (data as OldConnectionMessage).isScaleConnected !== undefined ||
    (data as NewConnectionMessage).isConnected !== undefined
  );
}

/**
 * Type guard that guarantees the correct type IScaleWeightMessage
 *
 * @public
 */
function isIScaleWeightMessage(
  data: IScaleConnectionMessage | IScaleWeightMessage
): data is IScaleWeightMessage {
  return (data as IScaleWeightMessage).weight !== undefined;
}

class RegistrationPage extends React.Component<OwnProps, undefined> {
  private timeOfLastWeightUpdate: number;
  private connectionTestInterval;

  componentDidMount() {
    const { canUseBluetooth } = this.props;

    this.fetchData();
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ canUseBluetooth: canUseBluetooth }));
    }

    window.addEventListener('message', this.onReceivePostMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onReceivePostMessage);

    if (this.connectionTestInterval) {
      clearInterval(this.connectionTestInterval);
    }
  }

  fetchData = () => {
    const { getRegistrationPoints, findTree, getSettings, resetStepper } = this.props;

    resetStepper();
    void getRegistrationPoints();
    void findTree();
    void getSettings();
  };
  /**
   * Handles the "message" event
   *
   * @param {MessageEvent} event - MessageEvent containing the data injected by app-scale
   * @public
   */
  onReceivePostMessage = (event: MessageEvent): void => {
    if (
      !event ||
      !event.data ||
      (!isIScaleWeightMessage(event.data) && !isIScaleConnectionMessage(event.data))
    )
      return;

    this.updateScaleConnection(event.data);
    //TODO: Remove this fallback function when all users have the version 1.0.3 of the Foodwaste app (app-scale) installed.
    this.updateScaleConnectionFallback(event.data);
  };

  /**
   * Sets the scale status to "disconnected" when the last message received was older than one second.
   * This is a fallback test for the devices that have not installed the app version 1.0.3 which relies solely on USB events.
   * TODO: Remove this fallback function when all users have the version 1.0.3 of the Foodwaste app (app-scale) installed.
   *
   * @param {IScaleConnectionMessage | IScaleWeightMessage} data : IScaleConnectionMessage - object containing the status of the scale, dispatched by USB events in app-scale
   *                                                               IScaleWeightMessage - object containing weight info, received from the scale and sent by app-scale
   * @public
   */
  updateScaleConnectionFallback = (data: IScaleConnectionMessage | IScaleWeightMessage) => {
    const {
      scaleStatus: { isConnected: isScaleConnected }
    } = this.props;

    if (isIScaleWeightMessage(data)) {
      this.timeOfLastWeightUpdate = new Date().getTime();

      if (!this.connectionTestInterval) {
        this.connectionTestInterval = setInterval(() => {
          const currentTime = new Date().getTime();

          if (currentTime - this.timeOfLastWeightUpdate >= 1000 && isScaleConnected) {
            const { setScaleStatus } = this.props;

            setScaleStatus({ isConnected: false });
            this.triggerScaleNotification();

            clearInterval(this.connectionTestInterval);
            this.connectionTestInterval = false;
          }
        }, 1000);
      }
    }
  };

  /**
   * Triggers the correct notification depending on the scale status.
   *
   * @public
   */
  triggerScaleNotification(connectionType?: ConnectionType) {
    const {
      intl,
      showNotification,
      scaleStatus: { isConnected: isScaleConnected }
    } = this.props;

    const notification = isScaleConnected
      ? connectionType
        ? intl.messages[`registration.scale.notification.connected.via${connectionType}`]
        : intl.messages['registration.scale.notification.connected.viaUSB']
      : intl.messages['registration.scale.notification.disconnected'];

    showNotification(notification);
  }

  /**
   * Updates the connection status of the scale depending on whether or not the USB is connected,
   * or it uses the weight event in the scenario where the USB was already connected when starting the app.
   *
   * @param {IScaleConnectionMessage | IScaleWeightMessage} data : IScaleConnectionMessage - object containing the status of the scale, dispatched by USB events in app-scale
   *                                                               IScaleWeightMessage - object containing weight info, received from the scale and sent by app-scale
   * @public
   */
  updateScaleConnection(data: IScaleConnectionMessage | IScaleWeightMessage) {
    const {
      setScaleStatus,
      scaleStatus: { isConnected: isScaleConnected, type: connectionType },
      canUseBluetooth
    } = this.props;

    // Don't change the scale status if the user has disabled Bluetooth in FoodWaste Settings,
    // and if the connection type is BLE
    if (
      !canUseBluetooth &&
      (connectionType === 'BLE' ||
        (isIScaleConnectionMessage(data) && isNewConnectionMessage(data) && data.type === 'BLE') ||
        (isIScaleWeightMessage(data) && data.connectionType === 'BLE'))
    ) {
      return;
    }

    const isDifferentStatus: boolean =
      isIScaleConnectionMessage(data) &&
      (isNewConnectionMessage(data)
        ? isScaleConnected !== data.isConnected || connectionType !== data.type
        : isScaleConnected !== data.isScaleConnected);

    if (isIScaleConnectionMessage(data) && isDifferentStatus) {
      // If we receive a scale connection message and the status is different, set that in the client
      setScaleStatus({
        isConnected: isNewConnectionMessage(data) ? data.isConnected : data.isScaleConnected,
        type: isNewConnectionMessage(data) ? data.type : undefined
      });
      this.triggerScaleNotification(isNewConnectionMessage(data) ? data.type : undefined);
    } else if (isIScaleWeightMessage(data) && !isScaleConnected) {
      // Otherwise, if it's a weight message and the client does not show that we are connected,
      // it means that the USB/BLE connection event was triggered before the client was loaded. Therefore, show the correct status in the client.
      setScaleStatus({
        isConnected: true,
        type: data.connectionType
      });
      this.triggerScaleNotification(data.connectionType);
    }
  }

  render() {
    const {
      intl,
      step,
      loading,
      isScaleClient,
      logout,
      nodesHistory,
      updateStepper,
      resetStepper,
      guestRegistrationOnly = false
    } = this.props;
    const StepComponent: React.JSXElementConstructor<any> =
      COMPONENTS_BY_STEP[guestRegistrationOnly ? 2 : step];

    return (
      <div
        className={classNames('registrationPageContainer', {
          isScaleClient: isScaleClient,
          guestRegistrationPage: step === 2
        })}
      >
        <Helmet title={intl.messages['registration.headline']} />
        <Grid container spacing={4}>
          <Grid
            className={classNames('item-selections form-content', {
              overlay: loading,
              'with-scale': isScaleClient
            })}
            xs={12}
            item
          >
            <StepComponent initRegistrationPoints={this.fetchData} />
          </Grid>
          <Grid item xs={12} className='stepper-steps-row'>
            <Stepper
              activeStep={step}
              nonLinear
              connector={<StepConnector />}
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                padding: 0
              }}
            >
              {step === 2 ? (
                <Slide in={true} direction={'right'} timeout={200}>
                  <Step>
                    <StepButton onClick={resetStepper} completed={true}>
                      {
                        // eslint-disable-next-line
                        (intl.messages['guestRegistration'] as any).other
                      }
                    </StepButton>
                  </Step>
                </Slide>
              ) : (
                nodesHistory.map((item: any, index: number) => {
                  const name = Object.keys(item)[0];
                  return (
                    <Slide in={true} direction={'right'} timeout={200} key={`${name}${index}`}>
                      <Step>
                        <StepButton onClick={() => updateStepper(index, name)} completed={true}>
                          {name}
                        </StepButton>
                      </Step>
                    </Slide>
                  );
                })
              )}
            </Stepper>
          </Grid>
          <Grid
            className={classNames('form-bar', {
              overlay: loading
            })}
            xs={12}
            item
          >
            {isScaleClient && (
              <Button
                type='button'
                className='logoutBtn'
                startIcon={<Icon icon={logoutImage} />}
                onClick={logout}
              >
                {intl.messages['auth.sign_out']}
              </Button>
            )}
          </Grid>
          <Grid item xs={12}>
            {step !== 2 ? <NodeHistory /> : <GuestRegistrationHistory />}
          </Grid>
        </Grid>
        <RegistrationSuccessModal />
        <GuestRegistrationSuccessModal />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  step: state.registration.step,
  loading: state.registration.loading,
  isScaleClient: state.user.client === 'scale',
  scaleStatus: state.registration.scaleStatus,
  canUseBluetooth: state.settings.canUseBluetooth,
  nodesHistory: state.registration.nodesHistory
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<
    RootState,
    void,
    AuthActions | UiActions | SettingsActions | NotificationActions | RegistrationActions
  >
) => ({
  logout: () => {
    dispatch(logout());
    dispatch(clearSelectorItems());
    browserHistory.push('/auth?client=scale');
  },
  updateStepper: (index: number, property: string) => {
    dispatch(registrationDispatch.updateStepper(index, property));
  },
  resetStepper: () => dispatch(registrationDispatch.resetStepper()),
  getSettings: () => dispatch(settingsDispatch.fetch()),
  showNotification: (message: string) => {
    dispatch(notificationDispatch.showNotification(message));
  },
  setScaleStatus: (status: ScaleStatus) => {
    dispatch(registrationDispatch.setScaleStatus(status));
  },
  findTree: () => dispatch(findTree({ includeSoftDeleted: true })),
  getRegistrationPoints: () =>
    dispatch(
      getRegistrationPoints({
        includeSoftDeleted: true,
        '$sort[name]': 1
      })
    )
});

export default connect<StateProps, DispatchProps, RegistrationPageProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RegistrationPage));
