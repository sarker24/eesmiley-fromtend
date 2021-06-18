import { Options } from 'highcharts';
import theme from 'styles/themes/reports';

const options: Options = {
  credits: {
    enabled: false
  },
  exporting: {
    enabled: false
  },
  chart: {
    style: {
      fontFamily: theme.typography.fontFamily,
      overflow: 'visible'
    }
  },
  title: {
    text: ''
  },
  legend: {
    enabled: false
  },
  tooltip: {
    headerFormat: '<span><b>{point.key}</b></span><br/>',
    style: {
      fontSize: theme.typography.pxToRem(13)
    }
  },
  plotOptions: {}
};

export default options;
