import merge from 'lodash/merge';
import BaseOptions from '../options';
import { Options, SeriesOptions } from 'highcharts';
import { SeriesData } from 'redux/ducks/reportData';
import { InjectedIntl } from 'react-intl';

export interface ChartSeriesConfig {
  series: SeriesData[];
  chartColors?: string[];
  unit?: string;
  intl: InjectedIntl;

  [any: string]: unknown;
}

export type SeriesMapper = (data: ChartSeriesConfig) => SeriesOptions | SeriesOptions[];
export type ThemeMapper = (data: ChartSeriesConfig) => Options;

function getChartData(
  seriesData: ChartSeriesConfig,
  seriesMappers: SeriesMapper[],
  themeMapper: ThemeMapper
): Options {
  const series = [].concat(...seriesMappers.map((transformer) => transformer(seriesData)));
  const theme = themeMapper(seriesData);

  return merge({}, BaseOptions, { ...theme, series });
}

export default getChartData;
