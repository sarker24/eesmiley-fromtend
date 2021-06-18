import * as Pie from './pie';
import * as React from 'react';
import * as Highcharts from 'highcharts';

export interface IOwnProps extends Pie.IOwnProps {
  innerSize?: string;
  startAngle?: number;
  endAngle?: number;
}

const pieOptions = ({
  innerSize = '35%',
  startAngle = -80,
  endAngle = 80
}): Highcharts.Options => ({
  plotOptions: {
    pie: {
      innerSize,
      startAngle,
      endAngle,
      dataLabels: {
        format: '{point.name} {point.percentage:.1f}%',
        verticalAlign: 'bottom',
        padding: 3,
        distance: 30
      }
    }
  },
  chart: {
    spacingLeft: 0,
    spacingRight: 0
  },
  legend: {
    enabled: false
  }
});

const SemiPie: React.FunctionComponent<IOwnProps> = ({
  configuration,
  innerSize,
  startAngle,
  endAngle,
  ...rest
}: IOwnProps) => {
  const options = [pieOptions({ innerSize, startAngle, endAngle })].concat(configuration);

  return <Pie.default shouldResize={true} configuration={options} {...rest} />;
};

export default SemiPie;
