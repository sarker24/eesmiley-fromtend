import * as React from 'react';
import Accounts from './Accounts';
import * as reportDataDispatch from 'redux/ducks/reportData';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { ReportActions } from 'redux/ducks/reports-new';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as reportFilterDispatch from 'redux/ducks/reports-new';
import {
  AccountPointFilterWithNames,
  getCompareToFilters,
  getFilter
} from 'redux/ducks/reports-new/selectors';
import { ReportDataActions } from 'redux/ducks/reportData';
import DownloadBtn from 'report/components/DownloadBtn';
import { useDownloadReportPDF } from 'report/utils/useDownloadPDF';
import { getChartPNGs } from 'report/Accounts/utils/generateChartImages';
import { chartColors } from 'report/Accounts/utils/constants';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface ComponentProps extends StoreProps, DispatchProps, InjectedIntlProps {}

const identifier = 'foodWastePerAccount';

const AccountsContainer: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    chartRefs,
    fetchData,
    accountSeries,
    filter,
    setBasis,
    accountPointFilters,
    intl
  } = props;

  const { data: chartsData, basis, timeRange } = accountSeries;
  const [isDownloading, downloadPDF] = useDownloadReportPDF({
    generateChartPNG: () => getChartPNGs({ chartRefs, chartsData, filter }),
    reportData: {
      // react-renderer bundles with huge yoga-template (0.5mb),
      AsyncDocument: async () => (await import('./PDF')).default,
      data: {
        chartsData,
        chartColors,
        reportFilter: filter,
        accountPointFilters,
        intl
      },
      basis,
      name: `accounts-${timeRange.from}-${timeRange.to}`
    }
  });

  const onTabChange = (basis) => {
    setBasis(basis);
  };

  useEffect(() => {
    void fetchData(identifier, { intl });
  }, [
    filter.basis,
    filter.dimension,
    filter.timeRange,
    filter.period,
    filter.filter,
    filter.comparisonFilters,
    filter.selectedGuestTypeNames
  ]);

  return (
    <Accounts
      onTabChange={onTabChange}
      accountSeries={accountSeries}
      downloadButton={<DownloadBtn isDownloading={isDownloading} onClick={downloadPDF} />}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const accountFilter: AccountPointFilterWithNames = getFilter(state);
  const compareToFilters: AccountPointFilterWithNames[] = getCompareToFilters(state);
  return {
    chartRefs: state.charts.chartRefs,
    accountSeries: state.reportData[identifier],
    filter: state.newReports,
    accountPointFilters: [accountFilter, ...compareToFilters]
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, ReportDataActions | ReportActions>
) => ({
  fetchData: (identifier, options) => dispatch(reportDataDispatch.fetchData(identifier, options)),
  setBasis: (basis) => dispatch(reportFilterDispatch.changeBasis(basis))
});

export { chartColors };
export default connect<StoreProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AccountsContainer));
