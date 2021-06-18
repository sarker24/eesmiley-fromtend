import theme from 'styles/themes/reports';
import createLockedSeries from 'report/components/Chart/utils/createLockedSeries';
import BaseOptions from 'report/components/Chart/Line/options';
import merge from 'lodash/merge';
import moment from 'moment';
import { max } from 'utils/array';
import { Formatter } from 'report/utils/createValueFormatter';
import {
  ChartSeriesConfig,
  SeriesMapper,
  ThemeMapper
} from 'report/components/Chart/utils/getChartData';

// todo: make SeriesMapper generic so we can extend the  base type
type ConfigWithExtra = ChartSeriesConfig & { extra: { target: number } };

const seriesMappers = (pointFormatter: Formatter): SeriesMapper[] => [
  (data: ConfigWithExtra) =>
    createLockedSeries({
      type: 'line',
      color: theme.palette.grey.A100,
      name: data.intl.messages['report.terms.target'],
      dashStyle: 'Solid',
      data: Array.from({
        length: data.series.slice(0, 1).flatMap((s) => s.points).length
      }).map((_, i) => [moment.utc(data.series[0].points[i].label).valueOf(), data.extra.target]),
      tooltip: {
        pointFormatter: function () {
          return (
            data.intl.messages['report.terms.target'] +
            ': <b> ' +
            pointFormatter.format(this.y, data.series[0].unit) +
            '</b>'
          );
        }
      }
    }),
  (data) => {
    const seriesNamesById = {
      foodwasteTotalTrend: data.intl.messages['report.terms.foodwasteRegistrations'],
      foodwastePerGuestTrend: data.intl.messages['report.terms.foodwasteRegistrations']
    };

    const serieName = data.series.length > 0 ? (seriesNamesById[data.series[0].id] as string) : '';

    const serieUnit = data.series.length > 0 ? data.series[0].unit : '';
    return {
      type: 'line',
      data: data.series
        .slice(0, 1)
        .flatMap((s) => s.points)
        .map((point) => [moment.utc(point.label).valueOf(), point.value]),
      marker: {
        lineColor: theme.palette.primary.main,
        symbol: 'circle',
        radius: 2.5
      },
      color: theme.palette.primary.main,
      name: serieName,
      tooltip: {
        xDateFormat: '%B %Y',
        pointFormatter: function () {
          return (
            serieName +
            ': <b> ' +
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            pointFormatter.format(this.y, serieUnit) +
            '</b>'
          );
        }
      }
    };
  }
];

const themeMapper = (pointFormatter: Formatter): ThemeMapper => (data: ConfigWithExtra) => {
  const { extra = { target: 0 } } = data;
  const unit = data.series.length > 0 ? data.series[0].unit : '';
  return merge({}, BaseOptions, {
    legend: {
      reversed: true
    },
    yAxis: [
      {
        tickInterval:
          extra.target > 0
            ? extra.target / 10
            : Math.ceil(
                max(
                  data.series
                    .slice(0, 1)
                    .flatMap((s) => s.points)
                    .map((p) => p.value)
                ) / 10
              ),
        labels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return pointFormatter.format(this.value, unit);
          }
        }
      }
    ]
  });
};

export { themeMapper, seriesMappers };
