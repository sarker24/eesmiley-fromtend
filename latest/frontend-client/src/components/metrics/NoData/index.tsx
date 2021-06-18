import * as React from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  font: {
    fontWeight: 'bold'
  },
  iconButton: {
    marginLeft: theme.spacing(1)
  }
}));

export interface NoDataProps {
  onHelp?: () => void;
}

const NoData: React.FunctionComponent<NoDataProps> = (props) => {
  const classes = useStyles(props);
  const { onHelp, children } = props;

  return (
    <div className={classes.root}>
      <Typography variant='body1' className={classes.font}>
        {children}
      </Typography>
      {onHelp && (
        <IconButton size='small' className={classes.iconButton} onClick={onHelp}>
          <HelpIcon fontSize='small' />
        </IconButton>
      )}
    </div>
  );
};

export default NoData;
