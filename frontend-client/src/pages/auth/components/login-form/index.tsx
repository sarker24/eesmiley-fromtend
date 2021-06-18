import * as React from 'react';
import Input from 'components/input';
import LanguageSwitcher from 'components/languageSwitcher';
import * as uiDispatch from 'redux/ducks/ui';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { onSubmitForm } from 'utils/helpers';
import { Button } from '@material-ui/core';
import { Spinner } from 'LoadingPlaceholder';
import { RootState } from 'redux/rootReducer';
import { Credentials } from 'redux/ducks/auth';
import Logo from './esmiley_logo.png';
import './index.scss';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  onSubmit: (credentials: Credentials) => void;
}

export interface LoginFormState {
  credentials: Credentials;
}

type LoginFormProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

//FIXME (Daniel) add locale to this and extract it to .env/system.json
const HELP_URL = 'https://secure.e-smiley.dk/api/esmiley_forgotten.php?language=dk';

const getPolicyLink = (language: string): string => {
  const baseLink = (domain: string, policyPage: string): string =>
    `https://www.esmiley.${domain}/${policyPage}`;
  switch (language) {
    case 'da':
      return baseLink('dk', 'privatlivspolitik');
    case 'sv':
      return baseLink('se', 'sekretesspolicy');
    case 'nb':
      return baseLink('no', 'personvernerklæring');
    default:
      return baseLink('com', 'privacy-policy');
  }
};

export class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);
    this.state = {
      credentials: {
        dealNumber: '',
        username: '',
        password: ''
      }
    };
  }

  handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const { credentials, onSubmit } = this.props;
    return onSubmit(credentials);
  };

  handleInputChanges = (e: React.ChangeEvent<HTMLInputElement>, input: string): void => {
    const { credentials, handleCredentials } = this.props;
    const payload = Object.assign({}, credentials, { [input]: e.target.value });
    handleCredentials(payload);
  };

  render() {
    const { intl, changeLocale, credentials, isLoggingIn, locale } = this.props;
    return (
      <div className='login-form'>
        <img className='login-form-image' src={Logo} alt='' />
        <form onSubmit={onSubmitForm(this.handleSubmit)}>
          <legend>{intl.messages['auth.sign_in']}</legend>
          <Input
            fullWidth
            focusOnMount={true}
            name='deal_id'
            type='number'
            required={true}
            doNotFormatValue={true}
            autoComplete={'deal-number'}
            value={credentials.dealNumber}
            label={intl.messages['auth.login_deal_number']}
            onChange={(e) => this.handleInputChanges(e, 'dealNumber')}
          />
          <Input
            fullWidth
            name='username'
            type='text'
            required={true}
            autoComplete={'username'}
            label={intl.messages['auth.login_username']}
            value={credentials.username}
            onChange={(e) => this.handleInputChanges(e, 'username')}
          />
          <Input
            fullWidth
            name='password'
            type='password'
            required={true}
            autoComplete={'current-password'}
            label={intl.messages['auth.login_password']}
            value={credentials.password}
            onChange={(e) => this.handleInputChanges(e, 'password')}
          />
          <LanguageSwitcher onChange={changeLocale} />
          <Button
            variant='contained'
            size={'large'}
            type='submit'
            fullWidth={true}
            color='primary'
            disabled={isLoggingIn}
            startIcon={isLoggingIn && <Spinner size='small' />}
          >
            {!isLoggingIn && intl.messages['auth.sign_in']}
          </Button>
        </form>
        {window.isScaleApp ? (
          <a href={HELP_URL} target='_blank' rel='noreferrer'>
            {intl.messages['auth.forgot']}
          </a>
        ) : (
          <a href={HELP_URL}>{intl.messages['auth.forgot']}</a>
        )}
        <a href={getPolicyLink(locale)} target='_blank' rel='noreferrer'>
          {intl.messages['base.privacyPolicy']}
        </a>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, UiActions>) => ({
  changeLocale: (locale) => dispatch(uiDispatch.changeLocale(locale)),
  handleCredentials: (payload) => dispatch(uiDispatch.handleCredentials(payload))
});

const mapStateToProps = (state: RootState) => ({
  locale: state.ui.locale,
  credentials: state.ui.credentials,
  isLoggingIn: state.auth.isLoggingIn
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(LoginForm));
