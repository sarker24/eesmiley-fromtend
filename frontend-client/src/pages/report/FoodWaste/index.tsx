import * as React from 'react';
import FoodWaste from './FoodWaste';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter, WithRouterProps } from 'react-router';
import { Basis, ReportActions } from 'redux/ducks/reports-new';
import * as reportsDispatch from 'redux/ducks/reports-new';
import { useEffect } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AccountPointFilterWithNames, getFilter } from 'redux/ducks/reports-new/selectors';
import { useDownloadReportPDF } from 'report/utils/useDownloadPDF';
import DownloadBtn from 'report/components/DownloadBtn';
import { getChartPNGs } from 'report/FoodWaste/utils/generateChartImages';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type FoodWasteContainerProps = StateProps &
  DispatchProps &
  RouteComponentProps<{ basis: Basis }, unknown> &
  InjectedIntlProps;

const chartColors = ['#7172b1', '#9adcdb', '#ed8888', '#f2a663', '#5499ad', '#bfbfbf'];

// only one that requires basis read from url, perhaps something we can change at some point to simplify logic,
// unless really necessary to expose foodwaste/per-guest as separate url
const FoodWasteContainer: React.FunctionComponent<FoodWasteContainerProps> = (props) => {
  const {
    chartRefs,
    params: { basis: requestedBasis = 'total' },
    foodWasteStatus,
    foodWasteMetrics,
    foodWasteOverview,
    setBasis,
    filter: {
      basis,
      dimension,
      timeRange: { from: startDate, to: endDate }
    },
    filter,
    selectedRegistrationPoints,
    selectedAccountNames,
    intl
  } = props;

  const [isDownloading, downloadPDF] = useDownloadReportPDF({
    generateChartPNG: () => getChartPNGs({ chartRefs, filter }),
    reportData: {
      AsyncDocument: async () => (await import('./PDF')).default,
      data: {
        chartColors,
        foodWasteStatus,
        foodWasteMetrics,
        foodWasteOverview,
        filter,
        selectedRegistrationPoints,
        selectedAccountNames,
        intl
      },
      basis,
      dimension,
      name: `foodwaste-${startDate}-${endDate}`
    }
  });

  useEffect(() => {
    if (filter.isInitialized && basis !== requestedBasis) {
      setBasis(requestedBasis);
    }
  }, [requestedBasis]);

  return (
    (!filter.isInitialized || basis === requestedBasis) && (
      <FoodWaste
        key={'foodwaste-' + basis}
        basis={basis}
        downloadButton={<DownloadBtn isDownloading={isDownloading} onClick={downloadPDF} />}
        filter={filter}
      />
    )
  );
};

const mapStateToProps = (state: RootState) => {
  const accountPointFilter: AccountPointFilterWithNames = getFilter(state);

  return {
    chartRefs: state.charts.chartRefs,
    foodWasteStatus: state.reportData.foodWasteStatus.data,
    foodWasteMetrics: state.reportData.foodWasteMetrics.data,
    foodWasteOverview: state.reportData.foodWasteOverview.data,
    filter: state.newReports,
    selectedRegistrationPoints: accountPointFilter.selectedRegistrationPoints,
    selectedAccountNames: accountPointFilter.accounts.map((account) => account.name)
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  setBasis: (basis) => dispatch(reportsDispatch.changeBasis(basis))
});

export default withRouter(
  connect<StateProps, DispatchProps, WithRouterProps>(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(FoodWasteContainer))
);
export { chartColors };
