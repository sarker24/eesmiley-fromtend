import * as React from 'react';
import { connect } from 'react-redux';
import RegistrationFrequency from 'report/RegistrationFrequency/RegistrationFrequency';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getFilter } from 'redux/ducks/reports-new/selectors';
import { useDownloadReportPDF } from 'report/utils/useDownloadPDF';
import { getChartPNGs } from 'report/RegistrationFrequency/utils/generateChartImages';
import DownloadBtn from 'report/components/DownloadBtn';
import { RootState } from 'redux/rootReducer';

type StateProps = ReturnType<typeof mapStateToProps>;
type RegistrationFrequencyContainerProps = StateProps & InjectedIntlProps;

const RegistrationFrequencyContainer: React.FunctionComponent<RegistrationFrequencyContainerProps> = (
  props
) => {
  const { chartRefs, regFrequency, intl, selectedAccountNames } = props;
  const {
    data: chartsData,
    timeRange: { from, to }
  } = regFrequency;
  const [isDownloading, downloadPDF] = useDownloadReportPDF({
    generateChartPNG: () => getChartPNGs({ chartRefs, filter: null, chartsData: null }),
    reportData: {
      AsyncDocument: async () => (await import('./PDF')).default,
      data: {
        regFrequencyMetrics: chartsData,
        intl,
        startDate: from,
        endDate: to,
        selectedAccountNames
      },
      name: `registration-frequency-${from}-${to}`
    }
  });

  return (
    <RegistrationFrequency
      downloadButton={<DownloadBtn isDownloading={isDownloading} onClick={downloadPDF} />}
    />
  );
};

const mapStateToProps = (state: RootState) => ({
  chartRefs: state.charts.chartRefs,
  regFrequency: state.reportData.regFrequencyMetrics,
  selectedAccountNames: getFilter(state).accounts.map((account) => account.name)
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(RegistrationFrequencyContainer)
);
