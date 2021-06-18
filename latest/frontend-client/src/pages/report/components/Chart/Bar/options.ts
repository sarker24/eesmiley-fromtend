import { Options } from 'highcharts';
import baseChartOptions from '../options';
import merge from 'lodash/merge';
import theme from 'styles/themes/reports';

const barHeight = 25;
const spaceBetweenSingleBars = 10;
const spaceBetweenGroupedBars = 16;

const options: Options = {
  chart: {
    type: 'bar'
  },
  xAxis: [
    {
      type: 'category',
      tickWidth: 1,
      tickLength: 7,
      tickColor: theme.palette.grey.A100,
      lineColor: theme.palette.grey.A100,
      showEmpty: false,
      labels: {
        align: 'left',
        reserveSpace: true,
        style: {
          fontSize: `${theme.typography.fontSize}px`,
          color: theme.palette.text.secondary,
          maxWidth: '40px'
        }
      }
    }
  ],
  yAxis: [
    {
      visible: false,
      min: 0
    }
  ],
  legend: {
    enabled: true,
    itemStyle: {
      fontSize: '16px',
      fontWeight: (900).toString(),
      color: theme.palette.text.secondary
    },
    itemHiddenStyle: {
      fontWeight: theme.typography.fontWeightRegular.toString(),
      color: theme.palette.text.secondary
    },
    symbolWidth: 14,
    symbolHeight: 14,
    symbolRadius: 2
  },
  plotOptions: {
    bar: {
      borderWidth: 0,
      pointWidth: barHeight,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        rotation: 0,
        align: 'left',
        crop: false,
        overflow: 'allow',
        style: {
          fontSize: `${theme.typography.fontSize}`,
          fontWeight: `${theme.typography.fontWeightRegular}`,
          textOutline: '0',
          color: theme.palette.grey[400],
          textOverflow: 'ellipsis'
        },
        y: 0,
        x: 0
      }
    }
  }
};

export { barHeight, spaceBetweenSingleBars, spaceBetweenGroupedBars };
export default merge({}, baseChartOptions, options);
