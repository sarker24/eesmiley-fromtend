import theme from 'styles/themes/reports';
import createLockedSeries from 'report/components/Chart/utils/createLockedSeries';
import BaseOptions from 'report/components/Chart/Line/options';
import merge from 'lodash/merge';
import moment from 'moment';
import { SeriesMapper, ThemeMapper } from 'report/components/Chart/utils/getChartData';

const seriesMappers: SeriesMapper[] = [
  (data) => ({
    type: 'line',
    data: data.series
      .slice(0, 1)
      .flatMap((s) => s.points)
      .map((point) => [moment.utc(point.label).valueOf(), point.value]),
    marker: {
      lineColor: '#2196f4',
      symbol: 'circle',
      radius: 2.5
    },
    name: data.intl.messages['report.terms.foodwasteRegistrations']
  }),
  (data) =>
    createLockedSeries({
      type: 'line',
      color: theme.palette.grey.A100,
      name: data.intl.messages['report.terms.avgRegistrations'],
      dashStyle: 'Dash',
      data: Array.from({
        length: data.series.slice(0, 1).flatMap((s) => s.points).length
      }).map((_, i) => [
        moment.utc(data.series[0].points[i].label).valueOf(),
        data.series[0].aggregates.avg
      ])
    }),
  (data) =>
    createLockedSeries({
      type: 'line',
      data: Array.from({
        length: data.series.slice(0, 1).flatMap((s) => s.points).length
      }).map((_, i) => [
        moment.utc(data.series[0].points[i].label).valueOf(),
        data.series[0].aggregates.max
      ]),
      color: theme.palette.success.main,
      name: data.intl.messages['report.frequency.registrationsPerAccount.bestPerforming'],
      visible: false
    }),
  (data) =>
    createLockedSeries({
      type: 'line',
      data: Array.from({
        length: data.series.slice(0, 1).flatMap((s) => s.points).length
      }).map((_, i) => [
        moment.utc(data.series[0].points[i].label).valueOf(),
        data.series[0].aggregates.min
      ]),
      color: theme.palette.error.main,
      name: data.intl.messages['report.frequency.registrationsPerAccount.worstPerforming'],
      visible: false
    })
];

const themeMapper: ThemeMapper = () => merge({}, BaseOptions);

export { themeMapper, seriesMappers };
