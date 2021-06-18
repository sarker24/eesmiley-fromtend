import merge from 'lodash/merge';
import BaseOptions, { barWidth } from 'report/components/Chart/Column/options';
import { SeriesData } from 'redux/ducks/reportData';
import { PointOptionsObject, SeriesOptionsType } from 'highcharts';
import { Formatter } from 'report/utils/createValueFormatter';
import { SeriesMapper, ThemeMapper } from 'report/components/Chart/utils/getChartData';

const seriesMappers = (): SeriesMapper[] => [
  (data) =>
    data.series.map(
      (series: SeriesData): SeriesOptionsType => ({
        type: undefined,
        data: series.points.map(
          (point, pointIndex): PointOptionsObject => ({
            y: point.value,
            name:
              point.label.toLowerCase() === 'other'
                ? data.intl.messages['report.terms.other']
                : point.label,
            color: pointIndex === series.points.length - 1 ? '#bfbfbf' : undefined
          })
        ),
        name: series.name,
        showInLegend: false
      })
    )
];

const themeMapper = (valueFormatter: Formatter): ThemeMapper => (data) => {
  return merge({}, BaseOptions, {
    chart: {
      width: data.series[0].points.length * barWidth + 100
    },
    plotOptions: {
      column: {
        dataLabels: {
          x: -5,
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.point.y, data.unit);
          }
        }
      }
    },
    tooltip: {
      headerFormat: `<span${data.intl.messages['report.accounts.averageFWPerGuest']} - <b>{point.key}</b></span><br/>`,
      pointFormatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `<b>${valueFormatter.format(this.y, data.unit)}</b>`;
      }
    },
    yAxis: [
      {
        visible: false
      }
    ],
    colors: data.chartColors
  });
};

export { themeMapper, seriesMappers };
