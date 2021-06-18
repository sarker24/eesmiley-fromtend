import * as React from 'react';
import SaladIcon from 'icons/salad';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '& > * + *': {
      marginLeft: theme.spacing(0.5)
    }
  },
  icon: {
    padding: '2px'
  }
}));

const MealIndicator: React.FunctionComponent = (props) => {
  const classes = useStyles(props);
  return (
    <div className={classes.root}>
      <span>=</span>
      <SaladIcon className={classes.icon} />
    </div>
  );
};

export default MealIndicator;
