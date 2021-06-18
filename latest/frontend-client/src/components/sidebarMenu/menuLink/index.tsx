import * as React from 'react';
import { Link, IndexLink, LinkProps } from 'react-router';
import { ListItemIcon, MenuItem, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { SidebarMenu } from 'styles/themes/global';
import classNames from 'classnames';

export interface MenuLinkProps {
  path?: string;
  href?: string;
  icon?: JSX.Element;
  text?: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  target?: string;
  hideText?: boolean;
}

const ExtLink: React.FunctionComponent<LinkProps> = (props) => {
  const { to, children, ...rest } = props;
  return (
    <a {...rest} href={to as string}>
      {children}
    </a>
  );
};

const MenuLink = React.forwardRef<HTMLElement, MenuLinkProps>((props, ref) => {
  const classes = useStyles(props);
  const { path, href, icon, text, isActive, onClick, hideText = false, ...rest } = props;

  if (!path && !href) {
    return null;
  }

  const LinkComponent = href ? ExtLink : path === '/' ? IndexLink : Link;
  const to = href || path;

  // due to outdated react-router, we cant use refs properly on Link
  return (
    <LinkComponent className={classNames(classes.link)} to={to} title={text} {...rest}>
      <MenuItem
        ref={ref as React.RefObject<HTMLLIElement>}
        className={classNames(classes.menuItem, { [classes.isActive]: isActive })}
        onClick={onClick}
      >
        {icon && (
          <ListItemIcon
            className={classNames(classes.menuItemIcon, { [classes.isActive]: isActive })}
          >
            {icon}
          </ListItemIcon>
        )}
        <Typography className={classNames(classes.text, { [classes.textHidden]: hideText })}>
          {text}
        </Typography>
      </MenuItem>
    </LinkComponent>
  );
});

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textDecoration: 'none',
    position: 'relative'
  },
  iconOnlyMenuItem: {},
  menuItem: {
    padding: `${theme.spacing(1.5)}px 0`,
    width: '100%'
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 'bold'
  },
  isActive: {
    color: theme.palette.primary.main,
    fill: theme.palette.primary.main
  },
  iconOnlyIcon: {
    minWidth: 'auto'
  },
  menuItemIcon: {
    width: SidebarMenu.collapsedWith,
    justifyContent: 'center'
  },
  textHidden: {
    display: 'none'
  }
}));

export default MenuLink;
