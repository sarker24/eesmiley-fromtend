import calculateChartHeight from 'report/components/Chart/Bar/utils/calculateChartHeight';
import merge from 'lodash/merge';
import BaseOptions from 'report/components/Chart/Bar/options';
import { Formatter } from 'report/utils/createValueFormatter';
import { ThemeMapper } from 'report/components/Chart/utils/getChartData';

const chartMargin = 0;

const themeMapper = (valueFormatter: Formatter): ThemeMapper => (data) => {
  return merge({}, BaseOptions, {
    chart: {
      height: calculateChartHeight({
        series: data.series,
        marginTop: chartMargin,
        marginBottom: chartMargin
      }),
      marginTop: chartMargin,
      marginBottom: chartMargin
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      bar: {
        groupPadding: 0.155 - 0.02 * data.series.length,
        dataLabels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.y, data.unit);
          }
        }
      }
    },
    tooltip: {
      pointFormatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `<b>${valueFormatter.format(this.y, data.unit)}</b> ${
          data.intl.messages['report.terms.foodwaste']
        }`;
      }
    },
    yAxis: [
      {
        max: Number(data.maxValue) * 1.5, // The 1.5 multiplier is to allow more space for the data labels
        labels: {
          formatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return valueFormatter.format(this.value, data.unit);
          }
        }
      }
    ],
    colors: data.chartColors
  });
};

export { themeMapper };
