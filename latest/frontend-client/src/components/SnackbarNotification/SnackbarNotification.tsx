import * as React from 'react';
import { Button, IconButton, Snackbar, SnackbarContent, Typography } from '@material-ui/core';
import { Link } from 'react-router';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import palette from 'styles/palette';

interface SnackbarNotificationProps {
  isOpen: boolean;
  transition: (props) => JSX.Element;
  onCloseClick: () => void;
  link?: string;
  headlineText?: string;
  buttonText?: string;
  Image?: JSX.Element;
}

const SnackbarNotification: React.FunctionComponent<SnackbarNotificationProps> = (props) => {
  const { isOpen, transition, onCloseClick, link, headlineText, buttonText, Image } = props;
  const classes = useStyles(props);

  const Content = (
    <>
      {headlineText && (
        <Typography component={'h4'} className={classes.headline}>
          {headlineText}
        </Typography>
      )}
      {Image && Image}
    </>
  );

  const Message = (
    <>
      {link ? (
        <Link to={link} className={classes.link}>
          {Content}
        </Link>
      ) : (
        { Content }
      )}
      {buttonText && (
        <Button variant={'contained'} component={Link} to={link} className={classes.button}>
          {buttonText}
        </Button>
      )}
    </>
  );

  const Action = (
    <IconButton size='small' aria-label='close' onClick={onCloseClick}>
      <CloseIcon fontSize='small' />
    </IconButton>
  );

  return (
    <Snackbar open={isOpen} TransitionComponent={transition}>
      <SnackbarContent
        classes={{ root: classes.snackbarContent }}
        message={Message}
        action={Action}
      />
    </Snackbar>
  );
};

const useStyles = makeStyles({
  snackbarContent: {
    background: 'white',
    color: '#333333'
  },
  link: {
    textDecoration: 'none'
  },
  headline: {},
  button: {
    marginTop: 20,
    backgroundColor: palette.primary.main,
    color: 'white',

    '&:hover': {
      backgroundColor: palette.primary.main
    }
  }
});

export default SnackbarNotification;
