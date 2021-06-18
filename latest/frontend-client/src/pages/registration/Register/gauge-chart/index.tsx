import './index.scss';
import Base, { IOwnProps as BaseProps } from 'charts/base';
import * as React from 'react';

interface IOwnProps extends BaseProps {
  value?: number;
  maxValue?: number;
}

export default function GaugeChart({ value, maxValue = 200, ...rest }: IOwnProps): JSX.Element {
  const gaugeDisplayValue = !value || value < 0 ? 0 : value > maxValue ? maxValue : value;

  return (
    <div className='gauge-chart'>
      <Base
        configuration={[
          {
            chart: {
              type: 'gauge' as const
            },
            plotOptions: {
              gauge: {
                dataLabels: {
                  enabled: false
                }
              },
              series: {
                animation: false
              }
            },
            yAxis: {
              tickWidth: 0,
              minorTickInterval: null,
              labels: {
                enabled: false
              },
              min: 0,
              max: maxValue,
              plotBands: [
                {
                  from: 0,
                  to: gaugeDisplayValue,
                  innerRadius: '40%',
                  outerRadius: '100%'
                }
              ]
            },
            tooltip: { enabled: false },
            pane: {
              startAngle: -80,
              endAngle: 80,
              background: [
                {
                  borderWidth: 0,
                  innerRadius: '40%',
                  outerRadius: '100%',
                  shape: 'arc'
                }
              ]
            }
          }
        ]}
        series={[
          {
            type: 'gauge',
            data: [gaugeDisplayValue]
          }
        ]}
        {...rest}
      />
    </div>
  );
}
