import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import * as authDispatch from 'redux/ducks/auth';
import { browserHistory } from 'react-router';
import LoginForm from './components/login-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import { AuthActions, Credentials } from 'redux/ducks/auth';
import './index.scss';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  location: { query: { token: string } };
}

type AuthenticationPageProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

export class AuthenticationPage extends React.Component<AuthenticationPageProps> {
  UNSAFE_componentWillReceiveProps(nextProps: AuthenticationPageProps) {
    const home = nextProps.client === 'scale' ? '/registration' : '/';
    if (nextProps.isLoggedIn) {
      return browserHistory.push(home);
    }
  }

  componentDidMount() {
    this.props.logoutSuccessful();
  }

  render() {
    const { login, intl } = this.props;
    return (
      <div className='login-container'>
        <Helmet title={intl.messages['auth.headline']} />
        <LoginForm
          onSubmit={(credentials: Credentials) => login(credentials, intl.messages['auth.failure'])}
        />
        <div className='image-container' />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoggedIn: state.auth.isLoggedIn && !!state.auth.tokenPayload,
  client: state.user.client
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, AuthActions>) => ({
  initLogin: (token?: string) => dispatch(authDispatch.initLogin(token)),
  login: (credentials: Credentials, errorMessage?: string) =>
    dispatch(authDispatch.login(credentials, errorMessage)),
  logoutSuccessful: () => dispatch(authDispatch.logoutSuccessful())
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AuthenticationPage));
