import * as React from 'react';
import classNames from 'classnames';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Collapse, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ApiError } from 'redux/ducks/error';

interface ErrorMessageProps {
  error: ApiError;
}

const ErrorMessage: React.FunctionComponent<ErrorMessageProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const { error, intl } = props;
  const [showError, setShowError] = React.useState<boolean>(false);

  const handleToggleError = () => {
    setShowError((isToggled) => !isToggled);
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <WarningIcon className={classes.headerIcon} />
        <Typography>{intl.messages['base.unexpectedError']}</Typography>
        <IconButton
          className={classNames(classes.expand, {
            [classes.expandOpen]: showError
          })}
          onClick={handleToggleError}
          aria-expanded={showError}
          aria-label='show error'
        >
          <ExpandMoreIcon />
        </IconButton>
      </div>
      <Collapse in={showError} timeout='auto'>
        {error.errorCode && (
          <Typography variant='overline' component='code' display='block'>
            Code {error.errorCode}
          </Typography>
        )}
        {error.message && (
          <Typography variant='overline' component='code' display='block'>
            {error.message}
          </Typography>
        )}
      </Collapse>
    </div>
  );
};

const useStyles = makeStyles<Theme, ErrorMessageProps>((theme) => ({
  root: {},
  header: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.error.main
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}));

export default injectIntl(ErrorMessage);
