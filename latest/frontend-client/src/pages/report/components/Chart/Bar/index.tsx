import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as Highcharts from 'highcharts';
import { Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { connect } from 'react-redux';
import * as chartsDispatch from 'redux/ducks/charts';
import cloneDeep from 'lodash/cloneDeep';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'redux/rootReducer';
import { ChartsActions } from 'redux/ducks/charts';
import exportData from 'highcharts/modules/exporting';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';
import { ChartRef } from 'declarations/chart';

exportData(Highcharts);

export interface OwnProps extends WithLoadingProps {
  chartOptions: Options;
  group?: boolean;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface ComponentProps extends OwnProps, DispatchProps {}

const BarChart: React.FunctionComponent<ComponentProps> = (props) => {
  const { chartOptions, registerChart, unregisterChart, group } = props;
  const classes = useStyles(props);
  const chartRef = useRef<ChartRef>();
  const [options, setOptions] = useState<Options>(chartOptions);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      registerChart(group ? 'barGroup' : 'bar', chart);

      return () => {
        unregisterChart(group ? 'barGroup' : 'bar', chart);
      };
    }
  }, []);

  useEffect(() => {
    const { series, ...rest } = chartOptions;

    if (series) {
      // UPDATE: this here probably is caused by the way the props are passed? should separate series data and chart config props,
      // since this issue is not present in donut chart.
      // Without this the colors are not mapped correctly when number of series change (seems a bit random how it works)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore colorCounter is not in highcharts typings
      chartRef.current.chart.colorCounter =
        chartOptions.series.length === 0 ? 0 : chartOptions.series.length - 1;
      const deepCopy = series ? cloneDeep(series) : [];
      setOptions({ ...rest, series: deepCopy });
    }
  }, [chartOptions]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      containerProps={{ className: classes.container }}
      ref={chartRef}
    />
  );
};

const useStyles = makeStyles<Theme, ComponentProps>({
  container: {
    overflow: 'visible !important',

    '& .highcharts-xaxis .highcharts-tick': {
      '&:nth-last-child(-n+3)': {
        display: 'none'
      }
    }
  }
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ChartsActions>) => ({
  registerChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.registerChart(chartType, chartRef)),
  unregisterChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.unregisterChart(chartType, chartRef))
});

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(withLoading(BarChart));
