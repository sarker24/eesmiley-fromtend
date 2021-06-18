import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Grid } from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import { fetchMetrics } from 'redux/ducks/dashboardNext';
import { connect } from 'react-redux';
import {
  getReportDashboardMetrics,
  getSelectedAccountIds,
  getTimeFilter
} from 'redux/ducks/reports-new/selectors';
import DashboardMetricCard from 'pages/dashboard/DashboardMetricCard';
import { makeStyles } from '@material-ui/core/styles';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type CarbonFootprintProps = StateProps & DispatchProps & InjectedIntlProps;

const useStyles = makeStyles({
  dashboardCard: {
    padding: 0
  }
});
const DashboardMetrics: React.FunctionComponent<CarbonFootprintProps> = (props) => {
  const classes = useStyles(props);
  const {
    timeFilter: { period, from, to },
    metrics,
    customerIds,
    fetchMetrics,
    state
  } = props;

  React.useEffect(() => {
    if (customerIds) {
      void fetchMetrics({ customerIds, timeRange: { from, to }, period });
    }
  }, [customerIds, period, from, to]);

  return (
    <Grid container alignContent={'flex-start'} justify={'space-around'} spacing={3}>
      {metrics.map((metric) => (
        <Grid key={metric.id} item xs={12} sm={4}>
          <DashboardMetricCard
            className={classes.dashboardCard}
            metric={metric}
            isLoading={state !== 'idle'}
            hideViewMore
          />
        </Grid>
      ))}
    </Grid>
  );
};

const mapStateToProps = (state: RootState) => ({
  state: state.dashboardNext.state,
  metrics: getReportDashboardMetrics(state),
  timeFilter: getTimeFilter(state),
  customerIds: getSelectedAccountIds(state)
});

const mapDispatchToProps = {
  fetchMetrics
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DashboardMetrics));
