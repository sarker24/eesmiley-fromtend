import calculateChartHeight from 'report/components/Chart/Bar/utils/calculateChartHeight';
import merge from 'lodash/merge';
import BaseOptions, { barHeight } from 'report/components/Chart/Bar/options';
import theme from 'styles/themes/reports';
import getMaxForAxis from 'report/components/Chart/utils/getMaxForAxis';
import getPlotLines from 'report/components/Chart/utils/getPlotLines';
import { Options } from 'highcharts';
import { SeriesData } from 'redux/ducks/reportData';
import { TOP_ROW_CHARTS_MIN_HEIGHT } from 'report/Accounts/utils/constants';
import { Formatter } from 'report/utils/createValueFormatter';
import {
  ChartSeriesConfig,
  SeriesMapper,
  ThemeMapper
} from 'report/components/Chart/utils/getChartData';

const chartTopMargin = 40;
const chartBottomMargin = 100;
const categoryLeftMarginInPx = 180;
const labelFontSizeInPx = 13;

type SeriesConfig = ChartSeriesConfig & {
  target: number;
  plotLines: { target: number; best: number; worst: number; average: number };
};

const seriesMappers = (): SeriesMapper[] => [
  (data: SeriesConfig) =>
    data.series.map((series) => ({
      type: 'bar',
      /*
    abit of hack to allow multiple series grouping with "categories" for each point,
    since highcharts doesnt support doing this directly (series are either grouped / stacked / nested).
    furthermore, aligning the categories to match each bar would be difficult with categories only
    * */
      dataLabels: [
        {
          inside: true,
          align: 'left',
          crop: false,
          overflow: 'allow',
          useHTML: false,
          x: -(categoryLeftMarginInPx + 5), // align sets wrapper to left: 5px
          style: {
            fontSize: `${labelFontSizeInPx}px`,
            textAlign: 'right',
            fontWeight: 'normal',
            lineHeight: `${barHeight}px`,
            color: theme.palette.text.secondary
          },
          formatter: function () {
            // would be simpler with css,
            // but that will break pdfs and tooltip z-index,
            // hence splitting manually
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            const name = this.point.name.trim() as string;
            // approximate width of the label with fontsize + margin offset / label length
            const splitIndex = Math.floor(
              ((labelFontSizeInPx / 2) * categoryLeftMarginInPx) / name.length
            );

            if (splitIndex >= name.length) {
              return name;
            }

            const a = name.slice(0, splitIndex);
            return a + '...';
          }
        },
        {
          align: 'left',
          inside: false,
          style: {
            lineHeight: `${barHeight}px`
          }
        }
      ],
      data: series.points
        .filter((point) => point.value > 0)
        .map((point, index) => ({
          x: index, // points are already ordered, thus using index as x to preserve that order
          y: point.value,
          name: point.label
        })),
      name: series.name
    }))
];

const themeMapper = (valueFormatter: Formatter): ThemeMapper => (data: SeriesConfig): Options => {
  return merge({}, BaseOptions, {
    chart: {
      height: calculateChartHeight({
        series: data.series,
        marginTop: chartTopMargin,
        marginBottom: chartBottomMargin,
        extraSpacing: 10,
        minHeight: TOP_ROW_CHARTS_MIN_HEIGHT
      }),
      marginTop: chartTopMargin,
      marginBottom: chartBottomMargin,
      marginRight: 100,
      marginLeft: categoryLeftMarginInPx
    },
    plotOptions: {
      bar: {
        // would allow removing empty gaps between bars, but breaking bug in 8.1.2
        // see https://github.com/highcharts/highcharts/issues/13710
        // centerInCategory: true,
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          allowOverlap: true,
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.y, data.unit);
          },
          style: {
            fontSize: '10px',
            fontWeight: '900',
            color: theme.palette.grey[400]
          }
        },
        tooltip: {
          pointFormatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return `<b>${valueFormatter.format(this.y, data.unit)}</b> ${
              data.intl.messages['report.terms.foodwaste']
            }`;
          }
        }
      }
    },
    xAxis: [
      {
        labels: {
          enabled: false
        }
      }
    ],
    yAxis: [
      {
        allowDecimals: false,
        max: getMaxForAxis(data.series, data.target),
        visible: true,
        min: 0,
        gridLineWidth: 0,
        lineWidth: 1,
        lineColor: theme.palette.grey.A100,
        tickWidth: 1,
        tickPosition: 'inside',
        tickLength: 5,
        title: null,
        labels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.value, data.unit);
          },
          style: {
            fontSize: '10px',
            color: theme.palette.grey[400],
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
            lineStyle: 'solid' as const,
            value: data.plotLines.target
          },
          {
            text:
              valueFormatter.format(data.plotLines.average) +
              ' ' +
              data.intl.messages['report.terms.averageFoodwaste'],
            lineStyle: 'dashed',
            value: data.plotLines.average
          }
        ])
      }
    ],
    colors: data.chartColors
  });
};

function limitVisiblePoints(
  series: SeriesData[],
  labels: string[],
  viewAll: boolean,
  limit: number
): SeriesData[] {
  if (viewAll || labels.length <= limit) {
    return series;
  }

  const labelMap = labels
    .slice(0, limit)
    .reduce((values, value) => ({ ...values, [value]: true }), {});
  return series.map((series) => ({
    ...series,
    points: series.points.filter((point) => labelMap[point.label])
  }));
}

export { seriesMappers, themeMapper, limitVisiblePoints };
