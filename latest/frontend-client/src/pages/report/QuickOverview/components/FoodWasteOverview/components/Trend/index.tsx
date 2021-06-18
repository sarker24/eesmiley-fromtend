import * as React from 'react';
import getChartData from 'report/components/Chart/utils/getChartData';
import { seriesMappers, themeMapper } from './utils/chartMappers';
import Trend from './Trend';
import * as reportDispatch from 'redux/ducks/reportData';
import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { ReportActions } from 'redux/ducks/reports-new';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import createValueFormatter from 'report/utils/createValueFormatter';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type TrendContainerProps = StateProps & DispatchProps & InjectedIntlProps;

const identifier = 'trendFoodWaste';

const TrendContainer: React.FunctionComponent<TrendContainerProps> = (props) => {
  const { filter, fetchData, intl, trendFoodWaste } = props;
  const { data: chartsData, dimension, basis } = trendFoodWaste;

  const [chartOptions, setChartOptions] = useState({});
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

  useEffect(() => {
    if (chartsData && Object.entries(chartsData).length > 0) {
      const valueFormatter = createValueFormatter(dimension, basis);

      setChartOptions(
        getChartData(
          {
            ...chartsData,
            intl
          },
          seriesMappers(valueFormatter),
          themeMapper(valueFormatter)
        )
      );
    }
  }, [chartsData]);

  return <Trend chartOptions={chartOptions} trendFoodWaste={trendFoodWaste} />;
};

const mapStateToProps = (state: RootState) => ({
  trendFoodWaste: state.reportData[identifier],
  filter: state.newReports
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TrendContainer));
