import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as Highcharts from 'highcharts';
import { Options, Series } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import mapDataToSeries from '../utils/mapDataToSeries';
import removeCurrentSeries from '../utils/removeCurrentSeries';
import getCustomDataLabel from './utils/getCustomDataLabel';
import { connect } from 'react-redux';
import * as chartsDispatch from 'redux/ducks/charts';
import { SeriesData } from 'redux/ducks/reportData';
import { Basis } from 'redux/ducks/reports-new';

import createValueFormatter from 'report/utils/createValueFormatter';
import { formatMoney, formatWeight } from 'utils/number-format';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { ChartsActions } from 'redux/ducks/charts';
import exportData from 'highcharts/modules/exporting';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';
import { ChartRef } from 'declarations/chart';

exportData(Highcharts);

interface ComponentOptions {
  colors: Array<string>;
  total: number;
  avg: number;
  showExactValues?: boolean;
  exactValues: SeriesData;
  basis: Basis;
}

interface OwnProps extends WithLoadingProps {
  seriesData: SeriesData | SeriesData[];
  chartOptions: Options;
  options: Partial<ComponentOptions>;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface ComponentProps extends OwnProps, StateProps, DispatchProps, InjectedIntlProps {}

// This component still needs to be refactored so it uses the same approach as the Bar, Line, Column chart components.
// Currently used on the Accounts (total amounts), Total Foodwaste and Quick Overview (total amounts) pages
const DonutChart: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    seriesData,
    options: { colors, exactValues },
    chartOptions,
    registerChart,
    dimension,
    unregisterChart,
    intl
  } = props;
  const chartRef = useRef<ChartRef>();
  const [isDifferentDataLength, setDifferentDataLength] = useState<boolean>(false);
  const [series, setSeries] = useState<Array<Series>>([]);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      registerChart('donut', chart);

      return () => {
        unregisterChart('donut', chart);
      };
    }
  }, []);

  useEffect(() => {
    updateSeries();
  }, [seriesData]);

  const [options, setOptions] = useState<Highcharts.Options>({
    ...chartOptions,
    colors: colors
  });
  useEffect(() => {
    if (isDifferentDataLength) {
      // TODO: Figure out a better solution for transitions when the data length changes
      // Whenever the data length changes (you have more slices or bars), Highcharts handles animations in a way I don't understand yet,
      // but which looks quite buggy, so this code causes the re-drawing of the series without Highcharts trying to map/match the indexes of the points
      removeCurrentSeries(chartRef);
    }
    updateOptions();
  }, [series, dimension]);

  const updateSeries = () => {
    const dataArray = Array.isArray(seriesData) ? seriesData : [seriesData];
    const deepCopiedData = JSON.parse(JSON.stringify(mapDataToSeries(dataArray, intl))) as Series[]; //https://github.com/highcharts/highcharts/issues/4259

    setSeries((prevSeries) => {
      setDifferentDataLength(
        prevSeries.length &&
          prevSeries[0].data &&
          deepCopiedData[0] &&
          deepCopiedData[0].data &&
          prevSeries[0].data.length !== deepCopiedData[0].data.length
      );

      return deepCopiedData;
    });
  };

  // here that are specific to report/accounts page donut chart
  const updateOptions = () => {
    const {
      options: { total, showExactValues, basis },
      intl
    } = props;
    const valueFormatter = showExactValues ? createValueFormatter(dimension, basis) : null;

    setOptions((prevState) =>
      Object.assign({}, prevState, {
        title: {
          ...prevState.title,
          text: `${
            dimension === 'cost' ? formatMoney(total || 0).toString() : formatWeight(total || 0)
          }
               <br><span style='font-size: 15px; font-weight: 400; line-height: 18px'>${
                 intl.messages['base.total']
               }</span>`
        },
        plotOptions: {
          pie: {
            dataLabels: {
              formatter: function () {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return getCustomDataLabel(this.point, exactValues, valueFormatter);
              }
            }
          }
        },
        series: series
      })
    );
  };

  return <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />;
};

const mapStateToProps = (state: RootState) => ({
  dimension: state.newReports.dimension
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ChartsActions>) => ({
  registerChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.registerChart(chartType, chartRef)),
  unregisterChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.unregisterChart(chartType, chartRef))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withLoading(DonutChart)));
