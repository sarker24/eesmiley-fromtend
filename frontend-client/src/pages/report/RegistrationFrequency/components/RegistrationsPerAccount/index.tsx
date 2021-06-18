import * as React from 'react';
import RegistrationsPerAccount from './RegistrationsPerAccount';
import getChartData from 'report/components/Chart/utils/getChartData';
import { seriesMappers, themeMapper } from './utils/chartMappers';
import { connect } from 'react-redux';
import * as reportDispatch from 'redux/ducks/reportData';
import { useEffect, useState } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getAvailableAccounts } from 'redux/ducks/reports-new/selectors';
import mapAccountNames from 'report/RegistrationFrequency/components/RegistrationsPerAccount/utils/mapAccountNames';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { ReportActions } from 'redux/ducks/reports-new';
import { Options } from 'highcharts';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RegistrationsPerAccountContainerProps = StateProps & DispatchProps & InjectedIntlProps;

const identifier = 'registrationsPerAccount';
const chartColors = ['#90cbfc', '#c8e5ff'];

const RegistrationsPerAccountContainer: React.FunctionComponent<RegistrationsPerAccountContainerProps> = (
  props
) => {
  const { accounts, registrationsPerAccount, fetchData, filter, intl } = props;
  const { data: chartsData, error, isLoading } = registrationsPerAccount;
  const { series = [], extra = { target: 0 } } = chartsData;
  const perAccountSeries = mapAccountNames(accounts, series[0]);

  const [chartOptions, setChartOptions] = useState<Options>(
    getChartData(
      {
        chartColors: chartColors,
        series: perAccountSeries.series,
        unit: perAccountSeries.unit,
        plotLines: {
          best: perAccountSeries.aggregates.max,
          worst: perAccountSeries.aggregates.min,
          average: perAccountSeries.aggregates.avg,
          target: extra.target
        },
        intl
      },
      seriesMappers,
      themeMapper
    )
  );

  useEffect(() => {
    void fetchData(identifier);
  }, [filter.basis, filter.dimension, filter.timeRange, filter.period, filter.filter]);

  useEffect(() => {
    setChartOptions(
      getChartData(
        {
          chartColors: chartColors,
          series: perAccountSeries.series,
          unit: perAccountSeries.unit,
          plotLines: {
            best: perAccountSeries.aggregates.max,
            worst: perAccountSeries.aggregates.min,
            average: perAccountSeries.aggregates.avg,
            target: extra.target
          },
          intl
        },
        seriesMappers,
        themeMapper
      )
    );
  }, [chartsData]);

  return (
    <RegistrationsPerAccount isLoading={isLoading} error={error} chartOptions={chartOptions} />
  );
};

const mapStateToProps = (state: RootState) => ({
  registrationsPerAccount: state.reportData[identifier],
  filter: state.newReports,
  accounts: getAvailableAccounts(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RegistrationsPerAccountContainer));
