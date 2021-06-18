import { InjectedIntlProps, injectIntl } from 'react-intl';
import './index.scss';
import Container from 'components/container';
import * as registrationDispatch from 'redux/ducks/registration';
import Overview from './Overview';
import AmountInsertion from './AmountInsertion';
import { Grid, Fade } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { onSubmitForm } from 'utils/helpers';
import * as notificationDispatch from 'redux/ducks/notification';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import { RegistrationActions } from 'redux/ducks/registration';
import { NotificationActions } from 'redux/ducks/notification';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RegisterProps = StateProps & DispatchProps & InjectedIntlProps;

const Register: React.FunctionComponent<RegisterProps> = (props) => {
  const { register, intl } = props;

  const handleRegister = () => {
    void register();
  };

  return (
    <Fade in={true} timeout={750}>
      <Container title={intl.messages['registration.btn']} className='register-step'>
        <form onSubmit={onSubmitForm(handleRegister)}>
          <Grid container spacing={4} className='register-grid-container' justify={'space-around'}>
            <Grid container item xs={12} sm={6} md={6} justify={'center'} alignItems={'flex-start'}>
              <Overview />
            </Grid>
            <Grid container item xs={12} sm={6} md={5} justify={'center'} alignItems={'flex-start'}>
              <AmountInsertion />
            </Grid>
          </Grid>
        </form>
      </Container>
    </Fade>
  );
};

const mapStateToProps = (state: RootState) => ({
  step: state.registration.step,
  soundSettings: getSettings(state).sound
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, RegistrationActions | NotificationActions>
) => ({
  register: () => dispatch(registrationDispatch.register()),
  showNotification: (message: string, isError?: boolean, icon?: JSX.Element) =>
    dispatch(notificationDispatch.showNotification(message, isError || false, icon ? icon : null)),
  updateStep: (step: registrationDispatch.StepShape) =>
    dispatch(registrationDispatch.updateStep(step))
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Register));
