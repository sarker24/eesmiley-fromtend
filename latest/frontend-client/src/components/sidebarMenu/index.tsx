import UserFoldout from 'sidebarMenu/userfoldout';

import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, WithRouterProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AssessmentIcon from '@material-ui/icons/Assessment';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import DollarIcon from '@material-ui/icons/AttachMoney';
import PeopleIcon from '@material-ui/icons/People';
import ScaleIcon from 'icons/scale';
import PinIcon from 'icons/pin';
import {
  ClickAwayListener,
  createStyles,
  Divider,
  Drawer,
  MenuItem,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import MenuLink, { MenuLinkProps } from 'sidebarMenu/menuLink';
import LanguageSwitcher from 'languageSwitcher';
import * as uiDispatch from 'redux/ducks/ui';
import * as authDispatch from 'redux/ducks/auth';
import classNames from 'classnames';
import { SidebarMenu } from 'styles/themes/global';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { Modal, UiActions } from 'redux/ducks/ui';
import { AuthActions } from 'redux/ducks/auth';
import SalesDialog from 'modalContent/salesDialog';
import { getSettings } from 'redux/ducks/settings';
import StepAnchor from 'Tutorial/StepAnchor';
import TutorialPopper from 'Tutorial/TutorialPopper';

const NoOp = () => {
  /* no op */
};
const ReportPathRegex = /^\/report\b/;

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      overflow: 'hidden',
      width: SidebarMenu.collapsedWith,
      transition:
        'width 0.2s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
      backgroundColor: '#fafafa',
      zIndex: 1000,
      border: 'none',
      '& .MuiDivider-root': {
        margin: `${theme.spacing(1.5)}px 0`
      }
    },
    paperOpen: {
      zIndex: 1300,
      width: (props: MenuProps) =>
        props.isMobile ? SidebarMenu.mobileWidth : SidebarMenu.desktopWidth,
      boxShadow: 'rgba(0, 0, 0, 0.26) 0px 2px 8px, rgba(0, 0, 0, 0.33) 0px 2px 8px',
      [theme.breakpoints.up('lg')]: {
        width: SidebarMenu.desktopWidth
      }
    },
    paperShadowSmall: {
      boxShadow: '1px 0 2px 0 rgba(0, 0, 0, 0.16)'
    },
    pin: {
      transition: 'transform 0.25s ease-in-out'
    },
    unPinned: {
      transform: 'rotate(45deg)'
    },
    secondaryMenu: {
      bottom: 0,
      position: 'absolute',
      width: '100%',
      paddingBottom: '16px',
      '@media (max-height:440px)': {
        position: 'initial',
        display: 'block',
        paddingBottom: '100px'
      }
    },
    backdrop: {
      zIndex: 1500
    },
    menuIcon: {
      width: SidebarMenu.collapsedWith,
      justifyContent: 'center',
      display: 'flex',
      '& img': {
        margin: 0
      }
    },
    menuText: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      paddingRight: theme.spacing(2)
    }
  });

type TMenuElement = {
  element: JSX.Element;
  expandedOnly?: boolean;
};

interface OwnProps {
  isMobile: boolean;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

// All the component's props
export interface MenuProps
  extends WithRouterProps,
    InjectedIntlProps,
    WithStyles<typeof styles>,
    OwnProps,
    StateProps,
    DispatchProps {}

type ExtendedMenuLink = Partial<MenuLinkProps> & { expandedOnly?: boolean };
type MenuItem = TMenuElement | ExtendedMenuLink;

export interface MenuState {
  mainMenuItems: MenuItem[];
  secondaryMenuItems: MenuItem[];
}

export class Menu extends React.Component<MenuProps> {
  private readonly helpUrl: string;

  constructor(props: MenuProps) {
    super(props);
    this.helpUrl = window['sysvars'].HELP_URL;
  }

  static isTMenuElement(item: MenuItem): item is TMenuElement {
    return (item as TMenuElement).element !== undefined;
  }

  static isTMenuLink(item: MenuItem): item is ExtendedMenuLink {
    return Boolean((item as ExtendedMenuLink).path || (item as ExtendedMenuLink).href);
  }

  logoutHandler = (): void => {
    const { logout, clearSelectorItems } = this.props;
    logout();
    clearSelectorItems();
  };

  showSalesModal = (e: React.MouseEvent) => {
    e.preventDefault();

    const { openModal, currency, massUnit, intl } = this.props;

    openModal({
      content: <SalesDialog currency={currency} massUnit={massUnit} />,
      title: intl.messages['sales.dialog.headline']
    });

    this.menuItemClickHandler();
  };

  buildLinks = (
    props: MenuProps
  ): { mainMenuItems: MenuItem[]; secondaryMenuItems: MenuItem[] } => ({
    mainMenuItems: [
      {
        path: '/',
        text: this.props.intl.messages['dashboard.headline'],
        icon: <HomeIcon />
      },
      {
        path: '/registration',
        text: this.props.intl.messages['measureWaste'],
        icon: <ScaleIcon />
      },
      {
        path: this.props.enableGuestRegistrationFlow ? '/guest-registration' : undefined,
        href: this.props.enableGuestRegistrationFlow ? undefined : '#',
        onClick: this.props.enableGuestRegistrationFlow ? undefined : this.showSalesModal,
        text: this.props.intl.messages['registerGuests'],
        icon: <PeopleIcon />
      },
      {
        href: '#',
        onClick: this.showSalesModal,
        text: this.props.intl.messages['report.sales_tab'],
        icon: <DollarIcon />
      },
      {
        element: <Divider key='sidebar-divider-0' />,
        expandedOnly: true
      },
      {
        path: '/project',
        text: this.props.intl.messages['project.dialog.project'],
        icon: <InsertDriveFileIcon />
      },
      {
        path: '/report',
        text: this.props.intl.messages['report.headline'],
        icon: <AssessmentIcon />
      },
      {
        path: '/settings',
        text: this.props.intl.messages['settings.headline'],
        icon: <SettingsIcon />
      },
      {
        element: <Divider key='sidebar-divider-1' />,
        expandedOnly: true
      },
      {
        element: props.isMobile ? (
          <div key='sidebar-language-switch'>
            <LanguageSwitcher
              classes={{ icon: props.classes.menuIcon, text: props.classes.menuText }}
              onChange={this.props.changeLocale}
            />
          </div>
        ) : null,
        expandedOnly: true
      },
      {
        href: this.helpUrl,
        target: '_BLANK',
        text: this.props.intl.messages['help'],
        icon: <HelpOutlineIcon />,
        expandedOnly: true
      },
      {
        href: '/auth',
        onClick: this.logoutHandler,
        text: this.props.intl.messages['auth.sign_out'],
        icon: <ExitToAppIcon />,
        expandedOnly: true
      }
    ],
    secondaryMenuItems: [
      {
        href: this.helpUrl,
        target: '_BLANK',
        icon: <HelpOutlineIcon />
      },
      {
        href: '/auth',
        onClick: this.logoutHandler,
        icon: <ExitToAppIcon />
      }
    ]
  });

  menuItemClickHandler = (): void => {
    const { isMenuPinned, isMenuOpen, hideMenu } = this.props;
    if (!isMenuPinned && isMenuOpen) {
      hideMenu();
    }
  };

  renderMenuItems(menuItems: MenuItem[]): JSX.Element[] {
    const { isMenuOpen, location } = this.props;

    return menuItems
      .filter((i) => !i.expandedOnly || (i.expandedOnly && isMenuOpen))
      .map(({ expandedOnly, ...item }: MenuItem, index: number) => {
        if (Menu.isTMenuElement(item)) {
          return item.element;
        }

        if (Menu.isTMenuLink(item)) {
          const LinkComponent = (
            <MenuLink
              key={`item_${index}`}
              {...item}
              // isActive is true/false based on whether the URL we're on is equal to the menu link's path,
              //          OR if the URL starts with the link's path, to test if we're on sub-pages
              isActive={
                item.path &&
                (item.path === '/'
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path))
              }
              onClick={item.onClick || this.menuItemClickHandler}
              hideText={!isMenuOpen}
            />
          );

          // probably could centralize available tutorial configs
          if (item.path === '/registration') {
            return (
              <StepAnchor
                key={`StepAnchor_item_${index}`}
                tutorialId={'tutorial-registrations'}
                step={1}
              >
                {LinkComponent}
              </StepAnchor>
            );
          }

          if (item.path === '/settings') {
            return (
              <StepAnchor key={`StepAnchor_item_${index}`} tutorialId={'tutorial-targets'} step={1}>
                {LinkComponent}
              </StepAnchor>
            );
          }

          return LinkComponent;
        }
      });
  }

  /**
   * Returns the menu item responsible for pinning the menu
   * @return { JSX.Element }
   * @public
   */

  renderPinItem = (): JSX.Element => {
    const { intl, togglePinning, isMenuPinned, classes } = this.props;
    return (
      <MenuLink
        href='#'
        onClick={(e) => {
          e.preventDefault();
          togglePinning();
        }}
        text={intl.messages['menu.pin_menu']}
        icon={
          <PinIcon className={classNames(classes.pin, { [classes.unPinned]: !isMenuPinned })} />
        }
        isActive={isMenuPinned}
      />
    );
  };

  render() {
    const {
      isLoggedIn,
      isMenuOpen,
      isMobile,
      hideMenu,
      toggleMenu,
      isMenuPinned,
      classes
    } = this.props;
    const { mainMenuItems, secondaryMenuItems } = this.buildLinks(this.props);
    const paperClass = classNames('sidebar-menu', classes.paper, {
      [classes.paperOpen]: isMenuOpen,
      [classes.paperShadowSmall]:
        (isMenuPinned && isMenuOpen) || (ReportPathRegex.test(location.pathname) && !isMenuOpen)
    });

    const disableClickAway = isMobile || isMenuPinned || !isMenuOpen;

    return isLoggedIn ? (
      <ClickAwayListener
        mouseEvent={disableClickAway ? false : 'onClick'}
        touchEvent={disableClickAway ? false : 'onTouchEnd'}
        onClickAway={disableClickAway ? NoOp : hideMenu}
      >
        <Drawer
          PaperProps={{ className: classNames(paperClass) }}
          onChange={toggleMenu}
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? isMenuOpen : true}
        >
          <UserFoldout menuHandler={toggleMenu} />
          {this.renderMenuItems(mainMenuItems)}
          {isMenuOpen && <Divider />}
          {isMenuOpen && this.renderPinItem()}
          {!isMenuOpen && (
            <div className={classes.secondaryMenu}>{this.renderMenuItems(secondaryMenuItems)}</div>
          )}
          <TutorialPopper /* here because of sidebar menu's high z-index */ />
        </Drawer>
      </ClickAwayListener>
    ) : null;
  }
}

const mapStateToProps = (state: RootState) => ({
  isMenuPinned: state.ui.isMenuPinned,
  isLoggedIn: state.auth.isLoggedIn,
  isMenuOpen: state.ui.isMenuOpen,
  currency: getSettings(state).currency,
  massUnit: getSettings(state).unit,
  enableGuestRegistrationFlow: getSettings(state).enableGuestRegistrationFlow
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<unknown, unknown, UiActions | AuthActions>
) => ({
  togglePinning: () => dispatch(uiDispatch.toggleMenuPinning()),
  changeLocale: (locale) => dispatch(uiDispatch.changeLocale(locale)),
  logout: () => dispatch(authDispatch.logout()),
  clearSelectorItems: () => dispatch(uiDispatch.clearSelectorItems()),
  hideMenu: () => dispatch(uiDispatch.hideMenu()),
  toggleMenu: () => dispatch(uiDispatch.toggleMenu()),
  openModal: (modal: Modal) => {
    dispatch(uiDispatch.showModal(modal));
  }
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(injectIntl(withStyles(styles)(Menu))));
