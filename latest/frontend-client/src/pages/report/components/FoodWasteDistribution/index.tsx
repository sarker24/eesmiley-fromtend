import * as React from 'react';
import * as reportDispatch from 'redux/ducks/reportData';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import FoodWasteDistribution from './FoodWasteDistribution';
import { ReportActions } from 'redux/ducks/reports-new';
import { chartColors } from 'report/FoodWaste';
import createValueFormatter from 'report/utils/createValueFormatter';
import getChartData from 'report/components/Chart/utils/getChartData';
import { seriesMappers, themeMapper } from './utils/chartMappers';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface ComponentProps extends StateProps, DispatchProps, InjectedIntlProps {}

const identifier = 'foodWasteOverview';

const FoodWasteDistributionContainer: React.FunctionComponent<ComponentProps> = (props) => {
  const { foodwasteOverview, fetchData, filter, intl } = props;
  const {
    data: { series },
    dimension,
    basis,
    error
  } = foodwasteOverview;
  const valueFormatter = createValueFormatter(dimension, basis);
  const columnChartOptions = getChartData(
    {
      series: series[1] ? [series[1]] : [],
      unit: (series[1] || {}).unit,
      chartColors,
      intl
    },
    seriesMappers(valueFormatter),
    themeMapper(valueFormatter)
  );

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

  return (
    <FoodWasteDistribution
      chartsData={foodwasteOverview}
      columnChartOptions={columnChartOptions}
      chartColors={chartColors}
      error={error}
    />
  );
};

const mapStateToProps = (state: RootState) => ({
  foodwasteOverview: state.reportData[identifier],
  filter: state.newReports
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FoodWasteDistributionContainer));
