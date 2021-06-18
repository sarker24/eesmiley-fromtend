import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';

interface ComponentProps {
  name: string;
  value: string;
  color: string;
}

const ChartHeader: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { name, value } = props;

  return (
    <Typography component={'h3'} className={classes.header}>
      <Typography component={'span'} className={classes.name}>
        {name}
      </Typography>
      <Typography component={'span'} className={classes.value}>
        {value}
      </Typography>
    </Typography>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  header: (props) => ({
    borderBottom: `2px solid ${props.color}`,
    paddingLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary
  }),
  name: {
    fontWeight: 900
  },
  value: {
    fontWeight: 900,
    float: 'right'
  }
}));

export default ChartHeader;
