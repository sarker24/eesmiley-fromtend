import * as React from 'react';
import SunIcon from 'components/icons/sun';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment';
import { RootState } from 'redux/rootReducer';
import { connect } from 'react-redux';
import SuccessModal from 'registration/SuccessModal';
import { resetLastRegistration } from 'redux/ducks/guestRegistrations';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import playSound from 'utils/playSound';
import { getSettings } from 'src/redux/ducks/settings';
import { injectIntl, InjectedIntlProps } from 'react-intl';

const timeoutInMs = 3000;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

type OwnProps = StateProps & DispatchProps & InjectedIntlProps;

const useStyles = makeStyles((theme) => ({
  value: {
    // this should match dashboard card metric value
    fontWeight: 800,
    fontSize: '26px',
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center'
  }
}));

// lots of duplication with RegistrationSuccessModal, todo refactor

const GuestRegistrationSuccessModal: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const timer = React.useRef<NodeJS.Timeout>();

  const { intl, lastRegistration, resetLastRegistration, sound } = props;
  const { date, amount, guestType } = lastRegistration || {};

  React.useEffect(() => {
    if (lastRegistration) {
      sound && sound.enabled && playSound(sound.url);
      timer.current = setTimeout(() => handleClose(), timeoutInMs);
      return () => clearTimeout(timer.current);
    } else {
      handleClose();
    }
  }, [lastRegistration]);

  const handleClose = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    resetLastRegistration();
  };

  return lastRegistration ? (
    <SuccessModal
      open={true}
      onClose={handleClose}
      title={intl.messages['registration.done']}
      subtitle={moment(date, API_DATE_FORMAT).format('L')}
      bodyTitle={
        guestType
          ? guestType.name
          : ((intl.messages['guest'] as unknown) as { other: string }).other
      }
      badgeIcon={<SunIcon />}
    >
      <Typography className={classes.value}>{amount}</Typography>
    </SuccessModal>
  ) : null;
};

const mapStateToProps = (state: RootState) => ({
  lastRegistration: state.guestRegistrations.lastRegistration,
  sound: getSettings(state).sound
});

const mapDispatchToProps = { resetLastRegistration };

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(GuestRegistrationSuccessModal));
