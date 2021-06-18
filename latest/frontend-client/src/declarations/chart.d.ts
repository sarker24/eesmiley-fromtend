import type * as Highcharts from 'highcharts';
import type * as React from 'react';

export type ChartRef = {
  chart: Highcharts.Chart;
  container: React.RefObject<HTMLDivElement>;
};
