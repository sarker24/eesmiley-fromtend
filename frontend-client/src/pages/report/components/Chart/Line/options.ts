import { Options } from 'highcharts';
import baseOptions from '../options';
import merge from 'lodash/merge';
import theme from 'styles/themes/reports';

const options: Options = {
  chart: {
    type: 'line'
  },
  yAxis: [
    {
      title: {
        text: ''
      },
      gridLineDashStyle: 'Dash',
      gridLineColor: theme.palette.grey.A400,
      tickInterval: 1,
      tickLength: 0,
      allowDecimals: false,
      labels: {
        style: {
          fontWeight: (900).toString()
        }
      },
      min: 0
    }
  ],
  xAxis: [
    {
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%e %b',
        month: '%B'
      },
      tickPosition: 'inside',
      tickLength: 5,
      lineColor: theme.palette.grey.A100,
      labels: {
        style: {
          fontWeight: (900).toString()
        }
      }
    }
  ],
  plotOptions: {
    line: {
      dashStyle: 'Solid',
      lineWidth: 2,
      enableMouseTracking: true,
      dataLabels: {
        enabled: false
      },
      marker: {
        enabled: true,
        lineWidth: 2,
        fillColor: theme.palette.common.white,
        lineColor: '#008b87',
        radius: 7
      }
    }
  },
  legend: {
    enabled: true,
    margin: 30,
    itemStyle: {
      fontSize: theme.typography.fontSize.toString(),
      fontWeight: theme.typography.fontWeightBold.toString(),
      color: theme.palette.text.secondary
    },
    itemHiddenStyle: {
      fontWeight: theme.typography.fontWeightRegular.toString(),
      color: theme.palette.text.secondary
    }
  }
};

export default merge({}, baseOptions, options);
