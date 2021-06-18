import * as Base from './base';
import * as React from 'react';
import { formatNumber } from 'utils/number-format';
import * as Highcharts from 'highcharts';

export type { IOwnProps } from './base';

const baseOptions: Highcharts.Options = {
  chart: {
    type: 'pie'
  },
  tooltip: {
    formatter: function () {
      return `${this.key}: <b>${formatNumber(this.percentage)}%</b>`;
    }
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: true,
        distance: 0,
        format: '{point.percentage:.1f}%',
        style: {
          fontSize: '10px',
          color: 'black',
          textOutline: '0px',
          fontWeight: '500',
          textDecoration: 'none'
        }
      },
      showInLegend: true
    }
  },
  legend: {
    align: 'left',
    verticalAlign: 'top',
    layout: 'vertical'
  }
};

const Pie: React.FunctionComponent<Base.IOwnProps> = ({
  configuration,
  ...rest
}: Base.IOwnProps) => {
  const options = [baseOptions].concat(configuration);

  return <Base.default configuration={options} {...rest} />;
};

export default Pie;
