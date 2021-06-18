import { Chart } from 'highcharts';

export { Chart } from 'highcharts';

export enum ChartsActionTypes {
  REGISTER_CHART = 'esmiley/charts/REGISTER_CHART',
  UNREGISTER_CHARTS = 'esmiley/charts/UNREGISTER_CHARTS',
  UNREGISTER_CHART = 'esmiley/charts/UNREGISTER_CHART'
}

export interface ChartRefs {
  [key: string]: Array<Chart>;
}

export interface ChartsState {
  chartRefs: ChartRefs;
}

type RegisterChartAction = {
  type: typeof ChartsActionTypes.REGISTER_CHART;
  payload: { chartType: string; chartRef: Chart };
};

type UnregisterChartsAction = {
  type: typeof ChartsActionTypes.UNREGISTER_CHARTS;
};

type UnregisterChartAction = {
  type: typeof ChartsActionTypes.UNREGISTER_CHART;
  payload: { chartType: string; chartRef: Chart };
};

export type ChartsActions = RegisterChartAction | UnregisterChartsAction | UnregisterChartAction;
