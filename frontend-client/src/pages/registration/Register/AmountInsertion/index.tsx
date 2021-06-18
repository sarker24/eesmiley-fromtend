import { InjectedIntlProps, injectIntl } from 'react-intl';
import SubmitButton from './SubmitButton';
import { Grid, InputAdornment, Theme, Typography } from '@material-ui/core';
import WeightHandler from './WeightHandler';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as registrationDispatch from 'redux/ducks/registration';
import { RegistrationActions, ScaleStatus } from 'redux/ducks/registration';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles } from '@material-ui/core/styles';
import ScanButton from './ScanButton';
import { BluetoothSearching } from '@material-ui/icons';
import * as notificationDispatch from 'redux/ducks/notification';
import moment from 'moment';
import { Moment } from 'moment';
import { DatePicker } from '@material-ui/pickers';
import EventIcon from '@material-ui/icons/Event';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { NotificationActions } from 'redux/ducks/notification';
import ScaleConfirmationModal from 'registration/ScaleConfirmationModal';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface ComponentProps extends StoreProps, DispatchProps, InjectedIntlProps {}

const isMobile = () => useMediaQuery('(max-width: 600px)');
let hasPrevBleConnection = false;

const AmountInsertion: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    date,
    intl,
    scaleStatus: { isConnected: isScaleConnected, type: connectionType },
    isScaleClient,
    setDate,
    canUseBluetooth,
    hasEsmileyScale,
    hasEsmileyScaleConfirmed
  } = props;

  const showScaleConnection = isScaleClient && hasEsmileyScale !== false;
  const [isConnecting, setConnecting] = useState<boolean>(false);
  const classes = useStyles(props);

  const onDateChange = (newDate: Moment) => {
    const date = new Date(newDate.toDate());
    date.setHours(0, 0, 0, 0);
    setDate(date);
  };

  // hasPrevBleConnection is set to "true" only once, but only if we can use Bluetooth, and if a BLE connection has been made
  useEffect(() => {
    if (canUseBluetooth && !hasPrevBleConnection && isScaleConnected && connectionType === 'BLE') {
      hasPrevBleConnection = true;
    }
  }, [isScaleConnected, connectionType]);

  useEffect(() => {
    if (canUseBluetooth) {
      window.addEventListener('message', onReceivePostMessage);

      // Trigger a scan when this component has been mounted
      // The reasons to do this is both to have an extra scan in the event of the first one failing,
      // but also to "teach" the user on the connecting / connected state
      // This scan is triggered only if a previous connection has been made and the scale is not currently connected
      if (
        hasPrevBleConnection &&
        !isScaleConnected &&
        window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage
      ) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ startScan: true }));
      }

      return () => {
        window.removeEventListener('message', onReceivePostMessage);
      };
    }
  }, []);

  // These messages are sent from app-scale. That's how we communicate with the React Native app.
  const onReceivePostMessage = (event: MessageEvent<ScaleStatus>) => {
    if (!event || !event.data) return;

    if (event.data.hasOwnProperty('isConnecting')) {
      setConnecting((prevState) => {
        triggerNoConnectionNotification(prevState, event.data);

        return event.data.isConnecting;
      });
    }
  };

  /**
   *  Communicate to the user when a connection attempt was not successful,
   *  so that they can take some measures like enabling Bluetooth, if disabled.
   *  This "Bluetooth" part of the message is especially needed for iOS,
   *  because on Android we automatically trigger the "Enable Bluetooth" popup, but we are not allowed to do that on iOS.
   *
   * @param {boolean} prevIsConnecting - previous state of isConnecting upon state change
   * @param {ScaleStatus} scaleStatus - the message received from the app, containing scale status details
   */
  const triggerNoConnectionNotification = (prevIsConnecting: boolean, scaleStatus: ScaleStatus) => {
    const isNoLongerTryingToConnect =
      prevIsConnecting === true && scaleStatus.isConnecting === false;
    const hasNoConnectedScale =
      !scaleStatus.hasOwnProperty('isConnected') || !scaleStatus.isConnected;

    if (isNoLongerTryingToConnect && hasNoConnectedScale) {
      const { showNotification } = props;
      void showNotification(intl.messages['registration.scale.notification.couldNotConnect'], true);
    }
  };

  return (
    <Grid className='amount-insertion' container spacing={4}>
      <WeightHandler />
      {!showScaleConnection && (
        <Typography variant='caption' className={classes.statusText}>
          {intl.messages['registration.scale.error.body']}
        </Typography>
      )}
      <Grid item xs={12}>
        {showScaleConnection && (
          <div className={classes.scaleHelp}>
            <div className={'scale-help-text'}>
              <div className={classes.scaleHelpTitleContainer}>
                <Typography variant='body1' component='span' className={classes.scaleHelpTitle}>
                  {isConnecting && canUseBluetooth
                    ? intl.messages['registration.scale.connectingToScale']
                    : isScaleConnected
                    ? connectionType
                      ? intl.messages[`registration.scale.connected.via${connectionType}`]
                      : intl.messages['registration.scale.connected.viaUSB']
                    : intl.messages['registration.scale.error.title']}
                </Typography>
                {!isConnecting &&
                  (isScaleConnected ? (
                    <CheckCircleIcon className='teal-fill status-icon' />
                  ) : (
                    <ErrorIcon className='red-fill status-icon' />
                  ))}
              </div>
              {!isConnecting && (
                <Typography variant='caption' className={classes.statusText}>
                  {isScaleConnected
                    ? intl.messages['registration.scale.ok.body']
                    : intl.messages['registration.scale.error.body']}
                </Typography>
              )}
            </div>
            {!isScaleConnected &&
              canUseBluetooth &&
              (isConnecting ? (
                <div className={classes.connectingIconContainer}>
                  <BluetoothSearching className={classes.connectingIcon} />
                </div>
              ) : (
                <div className={classes.scanButton}>
                  <ScanButton />
                </div>
              ))}
          </div>
        )}
        {isMobile() && (
          <DatePicker
            className={classes.mobilePicker}
            fullWidth
            format='L'
            value={moment(date)}
            onChange={onDateChange}
            inputProps={{ style: { textAlign: 'right', fontSize: '1rem' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EventIcon style={{ width: '1rem', height: '1rem' }} />
                </InputAdornment>
              )
            }}
          />
        )}
        <SubmitButton fullWidth />
      </Grid>
      {showScaleConnection && !hasEsmileyScaleConfirmed && <ScaleConfirmationModal />}
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  scanButton: {
    '& .MuiIconButton-root': {
      top: '33%',

      ['@media screen and (max-width: 599px)']: {
        position: 'static',
        marginLeft: theme.spacing(1)
      },
      ['@media screen and (min-width: 600px)']: {
        top: 14
      },

      ['@media screen and (min-width: 1024px)']: {
        top: 4
      },

      ['@media (max-height: 599px)']: {
        top: '50%',
        transform: 'translateY(-50%)',
        width: '56px',
        height: '56px'
      }
    }
  },
  connectingIcon: {
    fill: 'rgb(0, 150, 136)',
    color: 'rgb(0, 150, 136)',
    width: 30,
    height: 30
  },
  connectingIconContainer: {
    position: 'absolute',
    top: 22,
    right: 20,
    zIndex: 2,

    ['@media screen and (max-height: 599px)']: {
      top: '50%',
      margin: 0,
      transform: 'translateY(-50%)'
    },

    ['@media screen and (max-width: 599px)']: {
      top: '50%',
      margin: 0,
      transform: 'translateY(-50%)'
    },

    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      width: 30,
      height: 30,
      top: 0,
      left: 0,
      backgroundColor: 'rgb(0, 150, 136)',
      borderRadius: '50%',
      transition: 'opacity .3s, transform .3s',
      animation: `$pulse 2.5s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
      zIndex: -1
    }
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.6,
      transform: 'scale(1) translate3d(0,0,0)'
    },
    '50%': {
      opacity: 0,
      transform: 'scale(2.5) translate3d(0,0,0)'
    },
    '100%': {
      opacity: 0,
      transform: 'scale(2.5) translate3d(0,0,0)'
    }
  },
  statusText: {
    textAlign: 'center',
    display: 'inline-block',
    width: '100%',
    ['@media screen and (max-width: 599px)']: {
      textAlign: 'left'
    }
  },
  mobilePicker: {
    marginBottom: theme.spacing(3)
  },
  scaleHelp: {
    minHeight: theme.spacing(2),
    margin: `${theme.spacing(2)}px 0`,
    ['@media screen and (max-width: 599px)']: {
      display: 'flex',
      flexFlow: 'row nowrap'
    },
    ['@media screen and (max-height: 599px)']: {
      position: 'relative'
    }
  },
  scaleHelpTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ['@media screen and (max-width: 599px)']: {
      justifyContent: 'initial'
    }
  },
  scaleHelpTitle: {
    marginRight: theme.spacing(1),
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.palette.text.primary
  }
}));

const mapStateToProps = (state: RootState) => ({
  isScaleClient: state.user.client === 'scale',
  scaleStatus: state.registration.scaleStatus,
  date: state.registration.date,
  canUseBluetooth: state.settings.canUseBluetooth,
  hasEsmileyScale: state.settings.hasEsmileyScale,
  hasEsmileyScaleConfirmed: state.settings.hasEsmileyScaleConfirmed
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, RegistrationActions | NotificationActions>
) => ({
  setDate: (date: Date) => {
    dispatch(registrationDispatch.setDate(date));
  },
  showNotification: (message: string, isError: boolean, icon?: JSX.Element) => {
    dispatch(notificationDispatch.showNotification(message, isError || false, icon ? icon : null));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AmountInsertion));
