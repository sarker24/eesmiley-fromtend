import * as React from 'react';
import { useEffect, useRef } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import * as Highcharts from 'highcharts';
import { Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { connect } from 'react-redux';
import * as chartsDispatch from 'redux/ducks/charts';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'redux/rootReducer';
import { ChartsActions } from 'redux/ducks/charts';
import exportData from 'highcharts/modules/exporting';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';
import { ChartRef } from 'declarations/chart';

exportData(Highcharts);

interface OwnProps extends WithLoadingProps {
  chartOptions: Options;
  group?: boolean;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface ComponentProps extends OwnProps, DispatchProps {}

const ColumnChart: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { chartOptions, registerChart, unregisterChart } = props;
  const chartRef = useRef<ChartRef>();

  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      registerChart('column', chart);

      return () => {
        unregisterChart('column', chart);
      };
    }
  }, []);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{ className: classes.container }}
      ref={chartRef}
    />
  );
};

const useStyles = makeStyles<Theme, ComponentProps>({
  container: {
    display: 'flex',
    justifyContent: 'center'
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
)(withLoading(ColumnChart));
