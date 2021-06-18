import * as React from 'react';
import Avatar from 'sidebarMenu/avatar';
import { IconButton, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { eSmileyBlue } from 'styles/palette';
import { TopbarMenu } from 'styles/themes/global';
import { RootState } from 'redux/rootReducer';
import './index.scss';

const useStyles = makeStyles({
  root: {
    paddingLeft: '24px',
    paddingRight: 0,
    backgroundColor: eSmileyBlue,
    height: TopbarMenu.height
  },
  icon: {
    width: '48px',
    minWidth: 'auto'
  },
  avatar: {
    width: '24px',
    height: '24px'
  },
  text: {
    fontSize: '0.7rem',
    fontWeight: 200,
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  arrowIcon: {
    fill: '#ffffff'
  }
});

function getIdentity(state: RootState): React.ReactNode {
  const {
    settings: { useAccountNickname },
    user
  } = state;
  const { nickname, customerName, customerId, email, username } = user;

  const name = useAccountNickname && nickname ? nickname : customerName;
  if (username) {
    const id = name ? name : email ? email : username;
    return (
      <>
        <span>{id}</span>
        <span>({customerId})</span>
      </>
    );
  }
  return '';
}

type StateProps = ReturnType<typeof mapStateToProps>;

export interface OwnProps {
  menuHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

type UserFoldOutProps = StateProps & OwnProps;

export const UserFoldout: React.FunctionComponent<UserFoldOutProps> = (props) => {
  const classes = useStyles(props);
  const { user, identity, menuHandler } = props;

  //FIXME Change image to actual avatar cover image when implemented
  return (
    <ListItem
      className={classes.root}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <ListItemIcon className={classes.icon}>
        <Avatar className={classes.avatar} email={user.email} />
      </ListItemIcon>
      <ListItemText>
        <Typography component={'h4'} className={classes.text}>
          {identity}
        </Typography>
      </ListItemText>
      <ListItemIcon>
        <IconButton onClick={menuHandler}>
          <ChevronLeftIcon className={classes.arrowIcon} />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
  useAccountNickname: state.settings.useAccountNickname,
  identity: getIdentity(state)
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(UserFoldout);
