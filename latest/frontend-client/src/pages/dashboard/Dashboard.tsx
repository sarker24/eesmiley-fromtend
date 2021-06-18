import * as React from 'react';
import { Divider, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { CalendarPeriod } from 'DatePicker/utils/constants';
import Helmet from 'react-helmet';
import TimeFilter from 'pages/report/components/TimeFilter';
import { StatusMetric } from 'redux/ducks/dashboardNext';
import TipOfTheWeekCard from 'dashboard/TipOfTheWeekCard';
import EsmileyClubCard from 'dashboard/EsmileyClubCard';
import DashboardMetricCard from 'dashboard/DashboardMetricCard';

export interface DashboardProps {
  metrics: StatusMetric[];
  isLoading: boolean;
}

type OwnProps = InjectedIntlProps & DashboardProps;

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '1500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: theme.spacing(3)
  },
  header: {
    margin: theme.spacing(1.5, 0, 3),
    '&:after': {
      content: '""',
      flex: 1
    }
  },
  headerFilterRow: {
    [theme.breakpoints.down('md')]: {
      order: 1
    }
  },
  headerFilter: {
    maxWidth: '320px'
  },
  headerTitleRow: {
    [theme.breakpoints.down('md')]: {
      order: 0
    }
  },
  headerTitle: {},
  cardContainer: {},
  footerSection: {},
  divider: {
    height: '2px',
    width: '90%',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.grey.A100
  }
}));

const Dashboard: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles();
  const { intl, metrics, isLoading } = props;

  return (
    <Grid container justify='center' className={classes.root}>
      <Helmet title={intl.messages['dashboard.headline']} />
      <Grid container justify='space-between' className={classes.header} spacing={3}>
        <Grid item xs={12} sm={6} md={4} className={classes.headerFilterRow}>
          <TimeFilter
            skipFilterReload
            updateCache
            periods={[
              CalendarPeriod.week,
              CalendarPeriod.month,
              CalendarPeriod.quarter,
              CalendarPeriod.year
            ]}
            className={classes.headerFilter}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} className={classes.headerTitleRow}>
          <Typography variant='h1' className={classes.headerTitle} align='center'>
            {intl.messages['dashboard.headline']}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container spacing={3} className={classes.cardContainer}>
        {metrics.map((metric, i) => (
          <Grid key={`dashboard_card_${i}`} item xs={12} sm={6} md={4}>
            <DashboardMetricCard key={metric.id} metric={metric} isLoading={isLoading} />
          </Grid>
        ))}
      </Grid>
      <Divider className={classes.divider} />
      <Grid container spacing={3} className={classes.footerSection}>
        <Grid item xs={12} md={6}>
          <TipOfTheWeekCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <EsmileyClubCard />
        </Grid>
      </Grid>
    </Grid>
  );
};
export default injectIntl(Dashboard);
