import * as React from 'react';
import { Grid } from '@material-ui/core';
import BarChartGroup from 'report/components/BarChartGroup';
import { Donut } from 'report/components/Chart';
import donutChartOptions from 'report/components/Chart/Donut/options';
import Column from '../Chart/Column';
import { Options } from 'highcharts';
import ErrorMessage from 'report/components/ErrorMessage';
import { ApiError } from 'redux/ducks/error';
import { ReportChart, SeriesResponse } from 'redux/ducks/reportData';

interface ComponentProps {
  chartsData: ReportChart<SeriesResponse>;
  chartColors: Array<string>;
  columnChartOptions: Options;
  error: ApiError;
}

const FoodWasteDistribution: React.FunctionComponent<ComponentProps> = (props) => {
  const { chartsData, chartColors, columnChartOptions, error } = props;
  const {
    isLoading,
    basis,
    dimension,
    data: {
      // todo: need to be mapped in parent like columnChart,
      // chart.series = array ; dataSeries = array or object
      series: [totalSeries, ratioSeries]
    }
  } = chartsData;

  // move to parent/store = proper defaults
  const { series: groupSeries = [], aggregates = { total: 0 } } = totalSeries || {};

  return error ? (
    <ErrorMessage error={error} />
  ) : (
    <Grid container spacing={6} alignItems={'center'}>
      <Grid item xs={12} md={6} lg={5} container>
        {basis === 'per-guest' ? (
          <Grid container justify={'center'}>
            <Grid item xs={12} md={10}>
              <Column chartOptions={columnChartOptions} isLoading={isLoading} />
            </Grid>
          </Grid>
        ) : (
          <Donut
            options={{
              colors: chartColors,
              total: aggregates.total
            }}
            seriesData={ratioSeries || []}
            chartOptions={donutChartOptions}
            isLoading={isLoading}
          />
        )}
      </Grid>
      <Grid item xs={12} md={6} lg={7}>
        <Grid container spacing={4}>
          <BarChartGroup
            chartsData={groupSeries}
            colors={chartColors}
            dimension={dimension}
            basis={basis}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FoodWasteDistribution;
