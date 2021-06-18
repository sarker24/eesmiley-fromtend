import { Options } from 'highcharts';
import merge from 'lodash/merge';
import baseChartOptions from '../options';
import theme from 'styles/themes/reports';

const options: Options = {
  chart: {
    type: 'pie',
    height: '270px'
  },
  title: {
    verticalAlign: 'middle',
    style: {
      textAlign: 'center',
      fontSize: theme.typography.pxToRem(23),
      fontWeight: String(theme.typography.fontWeightBold),
      marginTop: '5px'
    },
    align: 'center',
    y: 25
  },
  tooltip: {
    pointFormat: '<b>{point.percentage:.2f}%</b>'
  },
  plotOptions: {
    pie: {
      innerSize: '65%',
      size: '90%',
      borderWidth: 3,
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        connectorShape: 'crookedLine',
        connectorPadding: 0,
        style: {
          fontSize: `${theme.typography.fontSize}px`,
          fontWeight: String(theme.typography.fontWeightRegular),
          color: theme.palette.text.secondary
        },
        useHTML: true
      }
    }
  }
};

export default merge({}, baseChartOptions, options);
