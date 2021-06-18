import * as React from 'react';
import { RootState } from 'redux/rootReducer';
import { fetchMetrics } from 'redux/ducks/dashboardNext';
import { connect } from 'react-redux';
import Dashboard from 'dashboard/Dashboard';
import AfterSignUpPopUpWrapper from 'dashboardOld/components/after-sign-up-pop-up-wrapper';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

type DashboardContainerProps = StateProps & DispatchProps;

const DashboardContainer: React.FunctionComponent<DashboardContainerProps> = (props) => {
  const {
    settingsLoaded,
    hasNoSettings,
    state,
    metrics,
    customerId,
    timeRange,
    period,
    fetchMetrics,
    saleAdded
  } = props;

  React.useEffect(() => {
    if (customerId && !hasNoSettings) {
      void fetchMetrics({ customerIds: [customerId], timeRange, period });
    }
  }, [hasNoSettings, customerId, period, timeRange.from, timeRange.to, saleAdded]);

  return hasNoSettings ? (
    <AfterSignUpPopUpWrapper
      settings={{ isInitial: !settingsLoaded, firstTimeNoSettings: hasNoSettings }}
    />
  ) : (
    <Dashboard metrics={metrics} isLoading={!settingsLoaded || state !== 'idle'} />
  );
};

const mapStateToProps = (state: RootState) => ({
  settingsLoaded: !state.settings.isInitial,
  hasNoSettings: state.settings.firstTimeNoSettings,
  customerId: state.user.customerId,
  timeRange: state.newReports.timeRange,
  period: state.newReports.period,
  metrics: state.dashboardNext.metrics,
  state: state.dashboardNext.state,
  // old guest registrations use sale data, need to refetch data
  // if guests in sale is added
  saleAdded: state.settings.enableGuestRegistrationFlow ? undefined : state.sales.lastSale
});

const mapDispatchToProps = {
  fetchMetrics
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
