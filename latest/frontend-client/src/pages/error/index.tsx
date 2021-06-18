import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Button } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import './index.scss';
import { RootState } from 'redux/rootReducer';

type StateProps = ReturnType<typeof mapStateToProps>;

export interface OwnProps {
  location: { query: { token: string } };
}

type ErrorPageProps = StateProps & InjectedIntlProps & OwnProps;

export class ErrorPage extends React.Component<ErrorPageProps> {
  UNSAFE_componentWillMount() {
    if (!this.props.isLoggedIn) return browserHistory.push('/auth');
  }

  UNSAFE_componentWillReceiveProps(nextProps: ErrorPageProps) {
    if (nextProps.isLoggedIn) return browserHistory.push(window.location);
  }

  render() {
    const { intl } = this.props;
    //FIXME Error code could potentially be dynamic if *everything* goes to the error page... BUT React returns 200 on * routes...
    return (
      <div className='errorPage'>
        <Helmet title={intl.messages['error.headline']} />
        <h1 className='errorPageCode'>404</h1>
        <div className='errorPageBody'>
          <h1 className='errorPageTitle'>{intl.messages['error.title']}</h1>
          <p>{intl.messages['error.body']}</p>
          <div className='errorPageBody__Buttons'>
            <Button
              variant='contained'
              onClick={() => {
                window.location.href = `${process.env.HELP_URL}`;
              }}
            >
              {intl.messages['help']}
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                browserHistory.push(this.props.client === 'scale' ? '/registration' : '/');
              }}
            >
              {intl.messages['report.navigation.startpage']}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoggedIn: state.auth.isLoggedIn,
  client: state.user.client
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(injectIntl(ErrorPage));
