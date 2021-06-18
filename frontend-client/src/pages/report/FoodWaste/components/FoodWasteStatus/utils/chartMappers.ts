import calculateChartHeight from 'report/components/Chart/Bar/utils/calculateChartHeight';
import merge from 'lodash/merge';
import BaseOptions, { barHeight } from 'report/components/Chart/Bar/options';
import theme from 'styles/themes/reports';
import getPlotLines from 'report/components/Chart/utils/getPlotLines';
import getMaxForAxis from 'report/components/Chart/utils/getMaxForAxis';
import { PointData } from 'redux/ducks/reportData';
import {
  ChartSeriesConfig,
  SeriesMapper,
  ThemeMapper
} from 'report/components/Chart/utils/getChartData';
import { Formatter } from 'report/utils/createValueFormatter';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment';

const chartTopMargin = 40;
const chartBottomMargin = 100;
const borderWidth = 2;

const seriesMappers = (): SeriesMapper[] => [
  (data) =>
    data.series
      .filter((series) => series.aggregates.total > 0 || series.aggregates.avg > 0)
      .map((series, seriesIndex) => ({
        type: 'bar',
        data: series.points.map((point) => ({
          y: point.value,
          name:
            point.label.toLowerCase() === 'other'
              ? data.intl.messages['report.terms.other']
              : point.label
        })),
        colorIndex: seriesIndex,
        name:
          series.name.toLowerCase() === 'other'
            ? data.intl.messages['report.terms.other']
            : series.name
      }))
];

const themeMapper = (
  valueFormatter: Formatter,
  labelFormatter: { format: (value: string) => string }
): ThemeMapper => (data: ChartSeriesConfig & { plotLines: { target: number } }) => {
  return merge({}, BaseOptions, {
    chart: {
      height: calculateChartHeight({
        series: data.series,
        marginTop: chartTopMargin,
        marginBottom: chartBottomMargin,
        isStackedSeries: true,
        barBorderWidth: 2,
        extraSpacing: 15
      }),
      marginTop: chartTopMargin,
      marginBottom: chartBottomMargin
    },
    plotOptions: {
      bar: {
        pointWidth: barHeight + borderWidth * 2,
        borderWidth: borderWidth,
        dataLabels: {
          enabled: false
        }
      },
      series: {
        stacking: 'normal'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-weight: 900">{series.name}</span><br/>',
      pointFormatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `<b>${valueFormatter.format(this.y)}</b> ${
          data.intl.messages['report.terms.foodwaste']
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
        } - ${moment(this.name, API_DATE_FORMAT).format('L')}`;
      }
    },
    xAxis: [
      {
        labels: {
          align: 'right',
          style: {
            fontSize: `${theme.typography.fontSize}px`,
            lineHeight: `${barHeight}px`,
            color: theme.palette.grey[400],
            maxWidth: 'none',
            textAlign: 'right'
          }
        },
        categories: data.series.flatMap((series) =>
          series.points.map((point: PointData): string => labelFormatter.format(point.label))
        )
      }
    ],
    yAxis: [
      {
        visible: true,
        min: 0,
        max: getMaxForAxis(data.series, data.plotLines.target, true),
        gridLineWidth: 0,
        lineWidth: 1,
        lineColor: theme.palette.grey.A100,
        tickWidth: 1,
        allowDecimals: false,
        tickPosition: 'inside',
        tickLength: 5,
        title: null,
        reversedStacks: false,
        stackLabels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.total);
          },
          enabled: true,
          align: 'right',
          x: 5,
          style: {
            color: theme.palette.grey[300],
            fontWeight: '900',
            fontSize: 10
          }
        },
        labels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.value);
          },
          align: 'center',
          style: {
            fontSize: 10,
            color: theme.palette.grey[300],
            letterSpacing: '0.24px',
            fontWeight: '900'
          }
        },
        plotLines: getPlotLines([
          {
            text:
              valueFormatter.format(data.plotLines.target) +
              ' ' +
              data.intl.messages['report.terms.target'],
            lineStyle: 'solid',
            value: data.plotLines.target
          }
        ])
      }
    ],
    colors: data.chartColors
  });
};

export { themeMapper, seriesMappers };
