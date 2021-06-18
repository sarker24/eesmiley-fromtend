import { Options } from 'highcharts';
import baseChartOptions from '../options';
import merge from 'lodash/merge';
import theme from 'styles/themes/reports';

export const barWidth = 25;

const options: Options = {
  chart: {
    type: 'column',
    height: 250
  },
  legend: {
    enabled: true
  },
  xAxis: [
    {
      type: 'category',
      lineColor: theme.palette.grey.A100,
      showEmpty: false,
      labels: {
        style: {
          fontSize: '10px',
          fontWeight: '900',
          color: theme.palette.grey[400]
        }
      }
    }
  ],
  yAxis: [
    {
      title: {
        text: ''
      },
      gridLineDashStyle: 'Dash',
      gridLineColor: theme.palette.grey.A400,
      labels: {
        style: {
          fontSize: '10px',
          fontWeight: '900',
          color: theme.palette.grey[400]
        }
      }
    }
  ],
  plotOptions: {
    column: {
      borderWidth: 0,
      pointWidth: barWidth,
      cursor: 'pointer',
      colorByPoint: true,
      dataLabels: {
        enabled: true,
        rotation: 0,
        align: 'left',
        crop: false,
        overflow: 'allow',
        style: {
          fontSize: '10px',
          fontWeight: '900',
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

export default merge({}, baseChartOptions, options);
