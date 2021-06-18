import * as React from 'react';
import * as settingsDispatch from '../../../../../redux/ducks/settings';
import { connect } from 'react-redux';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Grid,
  Button
} from '@material-ui/core';
import HelpText from 'components/helpText';
import Container from 'components/container';
import RefreshIcon from '@material-ui/icons/Refresh';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FailedPlaceholder from 'components/FailedPlaceholder';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { NotificationActions, showNotification } from 'redux/ducks/notification';
import CheckIcon from '@material-ui/icons/Check';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import {
  Account,
  AccountSubscriptions,
  getSettings,
  getSubscriptionAccounts,
  SettingsActions
} from '../../../../../redux/ducks/settings';

import './index.scss';
import { ThunkDispatch } from 'redux-thunk';

interface AccountsSettingsState {
  accounts: Partial<AccountSubscriptions>;
  isSaving: boolean;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type AccountsSettingsProps = StateProps & DispatchProps & InjectedIntlProps;

const parseSubscriptions = (
  activeSubscriptions: Account[],
  subscriptions: AccountSubscriptions
): AccountSubscriptions => {
  const accountSet = new Set(activeSubscriptions.map((account) => account.id));
  const { subscribed, notSubscribed } = subscriptions;
  const allSubscriptions = [...subscribed, ...notSubscribed];

  return {
    subscribed: allSubscriptions.filter((account) => accountSet.has(account.id)),
    notSubscribed: allSubscriptions.filter((account) => !accountSet.has(account.id))
  };
};

class AccountsSettings extends React.Component<AccountsSettingsProps, AccountsSettingsState> {
  constructor(props: AccountsSettingsProps) {
    super(props);
    this.state = {
      accounts: {
        subscribed: [],
        notSubscribed: []
      },
      isSaving: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<AccountsSettingsProps>) {
    const { activeSubscriptions, subscriptions } = nextProps;

    this.setState({
      isSaving: false,
      accounts: parseSubscriptions(activeSubscriptions, subscriptions)
    });
  }

  componentDidMount() {
    void this.props.fetchLegacyAccounts(this.props.user.customerId);
  }

  handleSubmit = () => {
    const { updateAccounts, showNotification, intl } = this.props;
    const {
      accounts: { subscribed }
    } = this.state;

    try {
      this.setState({ isSaving: true }, () => {
        void updateAccounts(subscribed).then(() => {
          showNotification(
            intl.messages['settings.accounts.hasBeenSaved'],
            false,
            <div className='icon'>
              <CheckIcon />
            </div>
          );
          this.setState({ isSaving: false });
        });
      });
    } catch (e) {
      this.setState({ isSaving: false });
    }
  };

  handleRefresh = () => {
    const {
      user: { customerId },
      activeSubscriptions,
      subscriptions
    } = this.props;
    this.setState({
      accounts: parseSubscriptions(activeSubscriptions, subscriptions)
    });
    void this.props.fetchLegacyAccounts(customerId);
  };

  handleAddAll = () => {
    const {
      accounts: { subscribed, notSubscribed }
    } = this.state;
    this.setState({
      accounts: {
        subscribed: [...subscribed, ...notSubscribed],
        notSubscribed: []
      }
    });
  };

  handleRemoveAll = () => {
    const {
      accounts: { subscribed, notSubscribed }
    } = this.state;
    this.setState({
      accounts: {
        subscribed: [],
        notSubscribed: [...notSubscribed, ...subscribed]
      }
    });
  };

  handlerUnsubscribeAccount = (accountId: number) => {
    const {
      accounts: { subscribed, notSubscribed }
    } = this.state;

    const account = subscribed.find((account) => accountId === account.id);
    this.setState({
      accounts: {
        subscribed: subscribed.filter((account) => account.id !== accountId),
        notSubscribed: [...notSubscribed, account]
      }
    });
  };

  handlerSubscribeAccount = (accountId: number) => {
    const {
      accounts: { subscribed, notSubscribed }
    } = this.state;
    const account = notSubscribed.find((account) => accountId === account.id);
    this.setState({
      accounts: {
        subscribed: [...subscribed, account],
        notSubscribed: notSubscribed.filter((account) => account.id !== accountId)
      }
    });
  };

  render() {
    const { intl, isInitial } = this.props;
    const { accounts, isSaving } = this.state;
    if (!isInitial) {
      if (accounts && (accounts.subscribed.length > 0 || accounts.notSubscribed.length > 0)) {
        return (
          <div className='accountsSettings'>
            <Toolbar
              className='toolBar'
              style={{ backgroundColor: 'transparent', paddingLeft: '12px', marginBottom: '24px' }}
              disableGutters
            >
              <Button disabled={isSaving} startIcon={<RefreshIcon />} onClick={this.handleRefresh}>
                {intl.messages['base.reload']}
              </Button>
              <Button
                variant='contained'
                color='primary'
                className='btn'
                disabled={isSaving}
                type='button'
                onClick={this.handleSubmit}
              >
                {intl.messages['base.save']}
              </Button>
            </Toolbar>
            <div>
              <Grid
                container
                spacing={10}
                style={{
                  height: 'calc(80vh - 56px)'
                }}
              >
                <Grid
                  item
                  xs={5}
                  md={5}
                  style={{
                    maxHeight: '100%'
                  }}
                >
                  <Container
                    className='listContainer'
                    title={
                      <HelpText helpText={intl.messages['help.settings.subscribed']}>
                        {intl.messages['settings.accounts.subscribedAccounts']}
                      </HelpText>
                    }
                  >
                    <div className='listInnerContainer'>
                      <List>
                        {accounts.subscribed.map((account) => (
                          <ListItem
                            key={account.id}
                            className='listItem listItemSubscribed'
                            onClick={() => {
                              this.handlerUnsubscribeAccount(account.id);
                            }}
                          >
                            <ListItemText primary={account.name} secondary={account.id} />
                            <ListItemIcon>
                              <ChevronRightIcon className='icon' />
                            </ListItemIcon>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </Container>
                </Grid>
                <Grid item xs={2} md={2}>
                  <div className='moveAllButtonsContainer'>
                    <Button startIcon={<ChevronLeftIcon />} onClick={this.handleAddAll}>
                      {intl.messages['settings.accounts.addAll']}
                    </Button>
                    <Button startIcon={<ChevronRightIcon />} onClick={this.handleRemoveAll}>
                      {intl.messages['settings.accounts.removeAll']}
                    </Button>
                  </div>
                </Grid>
                <Grid
                  item
                  xs={5}
                  md={5}
                  style={{
                    maxHeight: '100%'
                  }}
                >
                  <Container
                    className='listContainer'
                    title={
                      <HelpText helpText={intl.messages['help.settings.notSubscribed']}>
                        {intl.messages['settings.accounts.notSubscribedAccounts']}
                      </HelpText>
                    }
                  >
                    <div className='listInnerContainer'>
                      <List>
                        {accounts.notSubscribed.map((account) => (
                          <ListItem
                            key={account.id}
                            className={'listItem listItemNotSubscribed'}
                            onClick={() => {
                              this.handlerSubscribeAccount(account.id);
                            }}
                          >
                            <ListItemIcon>
                              <ChevronLeftIcon className='icon' />
                            </ListItemIcon>
                            <ListItemText primary={account.name} secondary={account.id} />
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </Container>
                </Grid>
              </Grid>
            </div>
          </div>
        );
      }
      return (
        <FailedPlaceholder
          className={'placeholder empty-data'}
          title={intl.messages['report.no_data.title']}
          description={intl.messages['settings.accounts.noDataToShow']}
        />
      );
    } else {
      return <LoadingPlaceholder />;
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  subscriptions: getSubscriptionAccounts(state),
  activeSubscriptions: getSettings(state).accounts,
  isInitial: getSettings(state).isInitial,
  user: state.user
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, SettingsActions | NotificationActions>
) => ({
  getSettings: () => dispatch(settingsDispatch.fetch()),
  fetchLegacyAccounts: (accountId: number) =>
    dispatch(settingsDispatch.fetchLegacyAccounts(accountId)),
  updateAccounts: (data: Account[]) =>
    dispatch(settingsDispatch.fetchAndUpdate({ accounts: data })),
  showNotification: (message: string, isError?: boolean, icon?: JSX.Element) =>
    dispatch(showNotification(message, isError || false, icon ? icon : null))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AccountsSettings));
