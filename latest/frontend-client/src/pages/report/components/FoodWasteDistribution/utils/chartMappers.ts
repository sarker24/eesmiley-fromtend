import merge from 'lodash/merge';
import BaseOptions from 'report/components/Chart/Column/options';
import createLockedSeries from 'report/components/Chart/utils/createLockedSeries';
import theme from 'styles/themes/reports';
import { SeriesData } from 'redux/ducks/reportData';
import {
  PointOptionsObject,
  SeriesLegendItemClickEventObject,
  SeriesOptionsType
} from 'highcharts';
import { Formatter } from 'report/utils/createValueFormatter';
import { SeriesMapper, ThemeMapper } from 'report/components/Chart/utils/getChartData';

const seriesMappers = (valueFormatter: Formatter): SeriesMapper[] => [
  (data) =>
    data.series.map(
      (series: SeriesData): SeriesOptionsType => ({
        type: undefined,
        data: series.points.map(
          (point): PointOptionsObject => ({
            y: point.value,
            name:
              point.label.toLowerCase() === 'other'
                ? data.intl.messages['report.terms.other']
                : point.label
          })
        ),
        name: series.name
          ? series.name.toLowerCase() === 'other'
            ? data.intl.messages['report.terms.other']
            : series.name
          : undefined,
        showInLegend: false
      })
    ),
  (data) =>
    createLockedSeries({
      type: 'line',
      color: theme.palette.grey.A100,
      name: data.intl.messages['report.foodwaste.perGuest.average'],
      lineWidth: 2,
      opacity: 0,
      tooltip: {
        headerFormat: `<span>${data.intl.messages['report.foodwaste.perGuest.average']}</span><br/>`,
        pointFormatter: function () {
          return `<b>${valueFormatter.format(this.y, data.unit)}</b>`;
        }
      },
      states: {
        hover: {
          lineWidthPlus: 0
        }
      },
      events: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        legendItemClick: (event: SeriesLegendItemClickEventObject) => event.preventDefault()
      },
      dashStyle: 'Dash',
      data: Array.from({
        length: data.series.slice(0, 1).flatMap((d) => d.points).length
      }).map(() => [data.series[0].aggregates.avg]) as PointOptionsObject[]
    })
];

const themeMapper = (valueFormatter: Formatter): ThemeMapper => (data) => {
  // todo global valid defaults
  const { series = [] } = data;
  const { aggregates = { avg: 0 } } = series[0] || {};
  return merge({}, BaseOptions, {
    plotOptions: {
      column: {
        dataLabels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.point.y, data.unit);
          }
        }
      }
    },
    tooltip: {
      headerFormat: `<span>${data.intl.messages['report.terms.averageFoodwastePerGuest']} - <b>{point.key}</b></span><br/>`,
      pointFormatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `<b>${valueFormatter.format(this.y, data.unit)}</b>`;
      }
    },
    yAxis: [
      {
        labels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.value, data.unit);
          }
        },
        plotLines: [
          {
            width: 2,
            value: aggregates.avg,
            color: theme.palette.grey.A100,
            dashStyle: 'Dash'
          }
        ]
      }
    ],
    colors: data.chartColors
  });
};

export { themeMapper, seriesMappers };
