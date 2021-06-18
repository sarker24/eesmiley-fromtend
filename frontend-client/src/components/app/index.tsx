import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Respond } from 'frontend-core';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import Nav from 'nav';
import Menu from 'sidebarMenu';
import Notification from 'components/notification';
import Modal from 'modal';
import theme from 'styles/themes/global';
import 'react-dates/initialize';
import 'react-placeholder/lib/reactPlaceholder.css';
import * as uiDispatch from 'redux/ducks/ui';
import * as authDispatch from 'redux/ducks/auth';
import * as userDispatch from 'redux/ducks/user';
import { Location } from 'history';
import { UiActions } from 'redux/ducks/ui';
import { HelmetProps } from 'react-helmet';
import LoadingPlaceholder from 'LoadingPlaceholder';
import { ThemeProvider } from '@material-ui/styles';
import classNames from 'classnames';
import { RootState } from 'redux/rootReducer';
import { AuthActions } from 'redux/ducks/auth';
import { SettingsActions } from 'redux/ducks/settings';
import { UserActions } from 'redux/ducks/user';
import { ErrorActions } from 'redux/ducks/error';
import { ThunkDispatch } from 'redux-thunk';
import './index.scss';

// Props received from the parent component
export interface OwnProps {
  children: JSX.Element;
  location: Location;
}

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

// All the component's props
interface IComponentProps extends InjectedIntlProps, OwnProps, StoreProps, DispatchProps {}

// The component's state
export interface IComponentState {
  isMobile: boolean;
  title: string;
}

/**
 * This is the App Wrapper, this is the logical start of the application.
 */
export class App extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      isMobile: false,
      title: null
    };
  }

  async UNSAFE_componentWillMount() {
    const { initLogin, setClient } = this.props;
    const { query } = this.props.location;

    await initLogin();
    this.handleResize();

    if (query && query.client) {
      setClient(query.client as string);
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  /**
   * Toggles the isMobile boolean depending on the 'tablet-up' and 'mobile' breakpoint 'listeners'
   * @public
   */
  handleResize = (): void => {
    new Respond(
      () => {
        this.setState((prevState) => ({ isMobile: !prevState.isMobile }));
      },
      this.state.isMobile ? 'tablet-up' : 'mobile'
    );
  };

  /**
   * Manipulates the title data from Helmet and updates the state to the new title.
   * @param { HelmetProps } titleObject: Object received from Helmet.
   * @public
   */
  titleModifier = (titleObject: HelmetProps): void => {
    // FIXME (Daniel) empty title => infinite loop
    if (titleObject && titleObject.title && titleObject.title.length > 0) {
      const pattern = new RegExp(/(.*)(?:-)/g);
      const title = pattern
        ? pattern.exec(titleObject.title)[0].replace('-', '')
        : this.state.title;
      if (this.state.title !== title) {
        const newState = Object.assign({}, this.state, { title });
        this.setState(newState);
      }
    }
  };

  render() {
    const {
      modal,
      children,
      routing,
      customerId,
      isMenuPinned,
      isMenuOpen,
      isLoggedIn,
      isScaleClient,
      isNotificationActive,
      hideModal,
      isScreenLocked
    } = this.props;
    const { isMobile, title } = this.state;
    const isReportPage =
      routing.locationBeforeTransitions &&
      routing.locationBeforeTransitions.pathname.indexOf('/report/') !== -1;
    const isAuthPage =
      routing.locationBeforeTransitions && routing.locationBeforeTransitions.pathname === '/auth';
    const isNavVisible = !isScaleClient && !isAuthPage;

    const mainWrapperClass = classNames('mainAppWrapper', {
      'menu-active': isMenuOpen && isLoggedIn,
      'menu-pinned': isMenuPinned,
      'is-reports-page': isReportPage,
      locked: isScreenLocked
    });

    const contentWrapperClass = classNames('mainAppViewContentWrapper', {
      'nav-visible': isNavVisible
    });
    const contentClass = classNames('mainAppViewContent', {
      'is-logged-in': isLoggedIn,
      'nav-visible': isNavVisible
    });

    return (
      <ThemeProvider theme={theme}>
        <Modal modal={modal} hideModal={hideModal}>
          <div className={mainWrapperClass}>
            <Helmet
              onChangeClientState={this.titleModifier}
              title={title}
              titleTemplate='%s - eSmiley FoodWaste'
            />
            <main className='mainAppView'>
              {isNavVisible && <Nav title={title} isMobile={isMobile} />}
              <div className={contentWrapperClass}>
                <div className={`${contentClass} ${isNotificationActive ? 'transition-down' : ''}`}>
                  {
                    // Don't mount the new Report pages until the user has been loaded
                    !isReportPage || (isReportPage && customerId) ? (
                      children
                    ) : (
                      <LoadingPlaceholder />
                    )
                  }
                  <Notification />
                </div>
                {!isScaleClient && <Menu isMobile={isMobile} />}
              </div>
            </main>
          </div>
        </Modal>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  authToken: state.auth.token,
  modal: state.ui.modal,
  customerId: state.user.customerId,
  isScreenLocked: state.ui.isScreenLocked,
  routing: state.routing,
  isMenuPinned: state.ui.isMenuPinned,
  isMenuOpen: state.ui.isMenuOpen,
  isLoggedIn: state.auth.isLoggedIn,
  isNotificationActive: state.notification.active,
  isScaleClient: state.user.client === 'scale'
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<
    RootState,
    void,
    UiActions | UserActions | AuthActions | SettingsActions | ErrorActions
  >
) => ({
  hideModal: () => dispatch(uiDispatch.hideModal()),
  initLogin: () => dispatch(authDispatch.initLogin()),
  setClient: (client) => dispatch(userDispatch.setClient(client))
});

const ConnectedApp = connect<StoreProps, DispatchProps, OwnProps & InjectedIntlProps>(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default injectIntl(ConnectedApp);
