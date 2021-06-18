import { RootState } from 'redux/rootReducer';
import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  AppBar,
  createStyles,
  IconButton,
  Theme,
  Toolbar,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import LanguageSwitcher from 'languageSwitcher';
import * as uiDispatch from 'redux/ducks/ui';
import { SidebarMenu } from 'styles/themes/global';
import classNames from 'classnames';
import MenuIcon from '@material-ui/icons/Menu';
import ModuleSelector from 'moduleSelector';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';
import './index.scss';

interface OwnProps {
  title: string;
  isMobile: boolean;
}

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const styles = (theme: Theme) =>
  createStyles({
    toolbar: {
      paddingLeft: 0 // to align with drawer
    },
    sidebarMenuMargin: {
      marginLeft: SidebarMenu.desktopWidth,
      paddingLeft: theme.spacing(2)
    },
    sidebarMenuButton: {
      width: SidebarMenu.collapsedWith,
      display: 'flex',
      justifyContent: 'center',
      '& svg': {
        fill: '#ffffff'
      }
    },
    navRight: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      marginLeft: 'auto',
      '& > * + *': {
        marginLeft: theme.spacing(2)
      }
    },
    languageSwitcher: {
      color: '#ffffff',
      '& svg': {
        fill: '#ffffff'
      }
    }
  });

// All the component's props
export interface IComponentProps
  extends InjectedIntlProps,
    OwnProps,
    StoreProps,
    DispatchProps,
    WithStyles<typeof styles> {}

/**
 * Navigation component
 */
export class Nav extends React.Component<IComponentProps> {
  render() {
    const { title, intl, toggleMenu, isMenuOpen, changeLocale, classes, isMobile } = this.props;

    return (
      <div className='topNavBar'>
        <AppBar className='nav'>
          <Toolbar className={classes.toolbar}>
            {isMenuOpen ? null : (
              <div className={classes.sidebarMenuButton}>
                <IconButton onClick={toggleMenu}>
                  <MenuIcon />
                </IconButton>
              </div>
            )}
            <Typography
              className={classNames({ [classes.sidebarMenuMargin]: isMenuOpen })}
              variant='h5'
            >
              {title || intl.messages['module.name']}
            </Typography>
            <div className={classes.navRight}>
              {!isMobile && (
                <LanguageSwitcher className={classes.languageSwitcher} onChange={changeLocale} />
              )}
              <ModuleSelector />
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  authToken: state.auth.token,
  isMenuOpen: state.ui.isMenuOpen
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, UiActions>) => ({
  toggleMenu: () => dispatch(uiDispatch.toggleMenu()),
  changeLocale: (locale) => dispatch(uiDispatch.changeLocale(locale))
});

export default connect<StoreProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withStyles(styles)(Nav)));
