import * as React from 'react';
import RegistrationsPerDay from './RegistrationsPerDay';
import getChartData from 'report/components/Chart/utils/getChartData';
import { seriesMappers, themeMapper } from './utils/chartMappers';
import { connect } from 'react-redux';
import * as reportDispatch from 'redux/ducks/reportData';
import { useEffect, useState } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReportActions } from 'redux/ducks/reports-new';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { Options as HighchartsOptions } from 'highcharts';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RegistrationsPerDayContainerProps = StateProps & DispatchProps & InjectedIntlProps;

const identifier = 'registrationsPerDay';

const RegistrationsPerDayContainer: React.FunctionComponent<RegistrationsPerDayContainerProps> = (
  props
) => {
  const { fetchData, filter, intl, registrationsPerDay } = props;
  const { data: chartsData, isLoading, error } = registrationsPerDay;
  const [chartOptions, setChartOptions] = useState<HighchartsOptions>(
    getChartData(
      {
        series: chartsData.series,
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
          series: chartsData.series,
          intl
        },
        seriesMappers,
        themeMapper
      )
    );
  }, [chartsData]);

  return <RegistrationsPerDay chartOptions={chartOptions} isLoading={isLoading} error={error} />;
};

const mapStateToProps = (state: RootState) => ({
  registrationsPerDay: state.reportData[identifier],
  filter: state.newReports
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RegistrationsPerDayContainer));
