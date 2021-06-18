import * as React from 'react';
import { connect } from 'react-redux';
import { chartColors } from 'report/FoodWaste';
import QuickOverview from 'report/QuickOverview/QuickOverview';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  AccountPointFilterWithNames,
  getFilter,
  getReportDashboardMetrics
} from 'redux/ducks/reports-new/selectors';
import { useDownloadReportPDF } from 'report/utils/useDownloadPDF';
import DownloadBtn from 'report/components/DownloadBtn';
import { getChartPNGs } from 'report/QuickOverview/utils/generateChartImages';
import { RootState } from 'redux/rootReducer';

type StateProps = ReturnType<typeof mapStateToProps>;
type QuickOverviewContainerProps = StateProps & InjectedIntlProps;

const QuickOverviewContainer: React.FunctionComponent<QuickOverviewContainerProps> = (props) => {
  const {
    chartRefs,
    foodWasteOverview,
    trendFoodWaste,
    foodWasteMetrics,
    regFrequencyMetrics,
    filter: {
      basis,
      dimension,
      timeRange: { from: startDate, to: endDate }
    },
    filter,
    selectedRegistrationPoints,
    selectedAccountNames,
    dashboardMetrics,
    intl
  } = props;

  const [isDownloading, downloadPDF] = useDownloadReportPDF({
    generateChartPNG: () => getChartPNGs({ chartRefs, filter }),
    reportData: {
      AsyncDocument: async () => (await import('./PDF')).default,
      data: {
        chartColors,
        foodWasteOverview,
        trendFoodWaste,
        foodWasteMetrics,
        regFrequencyMetrics,
        filter,
        selectedRegistrationPoints,
        selectedAccountNames,
        dashboardMetrics,
        intl
      },
      basis,
      dimension,
      name: `quick-overview-${startDate}-${endDate}`
    }
  });

  return (
    <QuickOverview
      downloadButton={<DownloadBtn onClick={downloadPDF} isDownloading={isDownloading} />}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const accountFilter: AccountPointFilterWithNames = getFilter(state);
  return {
    chartRefs: state.charts.chartRefs,
    foodWasteOverview: state.reportData.foodWasteOverview.data,
    trendFoodWaste: state.reportData.trendFoodWaste.data,
    foodWasteMetrics: state.reportData.foodWasteMetricsOverview.data,
    regFrequencyMetrics: state.reportData.regFrequencyMetrics.data,
    filter: state.newReports,
    selectedRegistrationPoints: accountFilter.selectedRegistrationPoints,
    selectedAccountNames: accountFilter.accounts.map((account) => account.name),
    dashboardMetrics: getReportDashboardMetrics(state)
  };
};

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(QuickOverviewContainer)
);
