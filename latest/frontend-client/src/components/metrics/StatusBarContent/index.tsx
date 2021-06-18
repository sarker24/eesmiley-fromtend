import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Theme, Typography } from '@material-ui/core';

export interface StatusBarContentProps {
  indicator?: React.ReactNode;
  children: React.ReactNode;
}

export interface StatusBarValueProps {
  value: string | number;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > * + *': {
      marginLeft: theme.spacing(0.5)
    }
  },
  value: {
    fontWeight: 800,
    fontSize: '1.1rem'
  },
  text: {
    fontWeight: 'bold'
  }
}));

export const StatusBarValue: React.FunctionComponent = (props) => {
  const classes = useStyles(props);
  const { children } = props;
  return (
    <Typography component={'span'} variant='body1' className={classes.value}>
      {children}
    </Typography>
  );
};

const StatusBarContent: React.FunctionComponent<StatusBarContentProps> = (props) => {
  const classes = useStyles(props);
  const { indicator, children } = props;

  return (
    <div className={classes.root}>
      {indicator}
      <Typography component={'span'} variant='body1' className={classes.text}>
        {children}
      </Typography>
    </div>
  );
};
export default StatusBarContent;
