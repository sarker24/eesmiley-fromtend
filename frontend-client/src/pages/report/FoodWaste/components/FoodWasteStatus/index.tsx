import * as React from 'react';
import FoodWasteStatus from './FoodWasteStatus';
import getChartData from 'report/components/Chart/utils/getChartData';
import { seriesMappers, themeMapper } from './utils/chartMappers';
import * as reportDispatch from 'redux/ducks/reportData';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ReportActions } from 'redux/ducks/reports-new';
import { chartColors } from 'report/FoodWaste';
import createValueFormatter from 'report/utils/createValueFormatter';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import { PERIOD_FORMAT } from 'utils/datetime';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type FoodWasteStatusContainerProps = StateProps & DispatchProps & InjectedIntlProps;
const identifier = 'foodWasteStatus';

const FoodWasteStatusContainer: React.FunctionComponent<FoodWasteStatusContainerProps> = (
  props
) => {
  const { foodwasteStatus, fetchData, filter, intl, error } = props;
  const { data, dimension, basis, period } = foodwasteStatus;

  useEffect(() => {
    void fetchData(identifier);
  }, [
    filter.basis,
    filter.dimension,
    filter.timeRange,
    filter.period,
    filter.filter,
    filter.selectedGuestTypeNames
  ]);

  const valueFormatter = createValueFormatter(dimension, basis);
  const labelFormatter = {
    format: (timestamp: string): string => moment(timestamp).format(PERIOD_FORMAT[period])
  };

  const chartOptions = getChartData(
    {
      series: (data.series[0] || {}).series || [],
      chartColors,
      plotLines: { target: (data.extra || {}).target },
      intl
    },
    seriesMappers(),
    themeMapper(valueFormatter, labelFormatter)
  );

  return <FoodWasteStatus chartOptions={chartOptions} chartsData={foodwasteStatus} error={error} />;
};

const mapStateToProps = (state: RootState) => ({
  filter: state.newReports,
  foodwasteStatus: state.reportData[identifier],
  error: state.reportData[identifier].error
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FoodWasteStatusContainer));
