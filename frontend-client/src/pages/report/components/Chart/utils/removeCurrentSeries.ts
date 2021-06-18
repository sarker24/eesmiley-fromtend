import { Series } from 'highcharts';
import { ChartRef } from 'declarations/chart';
import * as React from 'react';

const removeCurrentSeries = (chartRef: React.MutableRefObject<ChartRef>): void => {
  chartRef.current.chart.series.forEach((series: Series): void => series.remove());
};

export default removeCurrentSeries;
