import calculateChartHeight from 'report/components/Chart/Bar/utils/calculateChartHeight';
import merge from 'lodash/merge';
import BaseOptions, { barHeight } from 'report/components/Chart/Bar/options';
import theme from 'styles/themes/reports';
import getCategories from 'report/components/Chart/Bar/utils/getCategories';
import getPlotLines from 'report/components/Chart/utils/getPlotLines';
import {
  ChartSeriesConfig,
  SeriesMapper,
  ThemeMapper
} from 'report/components/Chart/utils/getChartData';

const chartTopMargin = 70;
const chartBottomMargin = 100;

type PlotLineOptions = {
  target: number;
  best: number;
  worst: number;
  average: number;
};

const seriesMappers: SeriesMapper[] = [
  (data) => {
    const seriesNamesById = {
      frequencyOnTargetDays: data.intl.messages['report.frequency.onScheduledDays'],
      frequencyOnOtherDays: data.intl.messages['report.frequency.onNonScheduledDays']
    };

    return data.series.map((series) => ({
      type: 'bar',
      data: series.points.map((point) => ({
        y: point.value,
        name: point.label
      })),
      name: seriesNamesById[series.id] as string
    }));
  }
];

const createValueFormatter = (unit: string) => ({
  format: (value: number) => `${value} ${unit}`
});

const themeMapper: ThemeMapper = (data: ChartSeriesConfig & { plotLines: PlotLineOptions }) => {
  const valueFormatter = createValueFormatter(data.unit);

  return merge({}, BaseOptions, {
    chart: {
      height: calculateChartHeight({
        series: data.series,
        marginTop: chartTopMargin,
        marginBottom: chartBottomMargin,
        isStackedSeries: true
      }),
      marginTop: chartTopMargin,
      marginBottom: chartBottomMargin,
      events: {
        load: function () {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          this.legend.title.translate(-180, 28);
        }
      }
    },
    legend: {
      title: {
        style: {
          fontWeight: 400,
          fontSize: 15,
          color: theme.palette.text.secondary
        },
        text: data.intl.messages['report.terms.foodwasteRegistrations']
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: false
        }
      },
      series: {
        stacking: 'normal'
      }
    },
    tooltip: {
      pointFormatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `<b>${valueFormatter.format(this.y)}</b> ${
          data.intl.messages['report.terms.foodwasteRegistrations']
        }`;
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
        categories: getCategories(data.series)
      }
    ],
    yAxis: [
      {
        visible: true,
        min: 0,
        max: 100,
        gridLineWidth: 0,
        lineWidth: 1,
        lineColor: theme.palette.grey.A100,
        tickWidth: 1,
        tickInterval: 10,
        tickPosition: 'inside',
        tickLength: 5,
        title: null,
        reversedStacks: false,
        stackLabels: {
          format: '{total} %',
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
            width: 2,
            value: data.plotLines.best,
            color: theme.palette.success.main,
            text:
              valueFormatter.format(data.plotLines.best) +
              ' ' +
              data.intl.messages['report.frequency.registrationsPerAccount.bestPerforming']
          },
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
              data.intl.messages['report.frequency.registrationsPerAccount.avgRegistrations'],
            lineStyle: 'dashed',
            value: data.plotLines.average
          },
          {
            width: 2,
            value: data.plotLines.worst,
            color: theme.palette.error.main,
            text:
              valueFormatter.format(data.plotLines.worst) +
              ' ' +
              data.intl.messages['report.frequency.registrationsPerAccount.worstPerforming']
          }
        ])
      }
    ],
    colors: data.chartColors
  });
};

export { themeMapper, seriesMappers };
