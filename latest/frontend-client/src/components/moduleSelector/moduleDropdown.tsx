import { Button, Theme, MenuItem, ListItemIcon, Popover, ListItemText } from '@material-ui/core';
import * as React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import LoadingPlaceholder from 'LoadingPlaceholder';
import { ModuleLink } from 'redux/ducks/ui';
import classNames from 'classnames';

const useStyles = makeStyles(
  (theme: Theme) => ({
    menuButton: {
      minHeight: '32px',
      paddingLeft: '32px',
      paddingRight: '32px',
      boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',

      '& .MuiButton-startIcon': {
        [theme.breakpoints.down('sm')]: {
          margin: 0
        }
      }
    },
    menuButtonIcon: {
      fill: '#ffffff'
    },
    menuButtonText: {
      color: '#ffffff',
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    menuLink: {
      '& a': {
        textDecoration: 'none'
      }
    },
    menuIcon: {
      color: 'rgba(0,0,0,0.87)'
    }
  }),
  { name: 'ModuleDropdown' }
);

export interface OwnProps {
  modules: ModuleLink[];
}

export interface ModuleSelectorState {
  anchorEl: any;
}

type ModuleSelectorProps = InjectedIntlProps & OwnProps;

const ModuleDropdown: React.FunctionComponent<ModuleSelectorProps> = (props) => {
  const classes = useStyles(props);
  const { intl, modules } = props;
  const [anchorEl, setAnchor] = React.useState<HTMLElement>(null);

  const handleCloseMenu = () => {
    setAnchor(null);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
  };

  const isLoading = !modules || !modules.length || Object.keys(modules[0]).length === 0;

  return (
    <div>
      <Button
        className={classes.menuButton}
        startIcon={<MenuIcon className={classes.menuButtonIcon} />}
        onClick={handleOpenMenu}
      >
        <span className={classes.menuButtonText}>{intl.messages['module.name']}</span>
      </Button>
      <Popover anchorEl={anchorEl} onClose={handleCloseMenu} open={Boolean(anchorEl)}>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          modules.map((item, index) => (
            <MenuItem className={classes.menuLink} key={`module_link_${index}`} value={index}>
              {item.icon && (
                <ListItemIcon>
                  <i className={classNames(item.icon, classes.menuIcon)} />
                </ListItemIcon>
              )}
              <ListItemText>
                <a href={item.link}>{item.label}</a>
              </ListItemText>
            </MenuItem>
          ))
        )}
      </Popover>
    </div>
  );
};

export default injectIntl(ModuleDropdown);
