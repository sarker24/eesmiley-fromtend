import * as React from 'react';
import { useEffect, useState } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Options, Chart } from 'highcharts';
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

interface OwnProps extends WithLoadingProps {
  chartOptions: Options;
}

interface DispatchProps {
  registerChart: (type: string, chart: Chart) => void;
  unregisterChart: (type: string, chart: Chart) => void;
}

interface ComponentProps extends OwnProps, DispatchProps, Options {}

const LineChart: React.FunctionComponent<ComponentProps> = ({
  chartOptions,
  registerChart,
  unregisterChart
}) => {
  const chartRef = React.createRef<ChartRef>();
  const [options, setOptions] = useState<Options>(chartOptions);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      registerChart('line', chart);

      return () => {
        unregisterChart('line', chart);
      };
    }
  }, []);

  function update(data) {
    setOptions(data);
  }

  useEffect(() => {
    // The chart is cropped off a bit when initially loaded, but gets fixed when resizing the window.
    // This triggers a reflow when the component is mounted.
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.reflow();
    }
  }, []);

  useEffect(() => {
    update(cloneDeep(chartOptions));
  }, [chartOptions]);

  return <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />;
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ChartsActions>) => ({
  registerChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.registerChart(chartType, chartRef)),
  unregisterChart: (chartType, chartRef) =>
    dispatch(chartsDispatch.unregisterChart(chartType, chartRef))
});

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(withLoading(LineChart));
