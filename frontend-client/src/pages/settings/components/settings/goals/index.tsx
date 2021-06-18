import * as React from 'react';
import { Grid } from '@material-ui/core';
import FoodwasteTargetCard from 'settings/components/settings/goals/FoodwasteTargetCard';
import FrequencyCard from 'settings/components/settings/goals/FrequencyCard';
import { makeStyles } from '@material-ui/core/styles';

type GoalsProps = {
  /* empty */
};

const useStyles = makeStyles({
  root: {
    maxWidth: 1600
  }
});

const Goals: React.FunctionComponent<GoalsProps> = (props) => {
  const classes = useStyles(props);
  return (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12} md={6}>
        <FrequencyCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <FoodwasteTargetCard />
      </Grid>
    </Grid>
  );
};

export default Goals;
