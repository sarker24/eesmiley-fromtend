import { formatNumber } from 'utils/number-format';
import Highcharts from 'highcharts';

export default (): Highcharts.Options => {
  const height = 250;

  return {
    credits: {
      enabled: false
    },
    chart: {
      height: height,
      type: 'gauge' as const,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      spacingBottom: 0,
      animation: true,
      margin: [0, 0, 0, 0]
    },
    exporting: {
      enabled: false
    },
    title: null,
    pane: {
      center: ['50%', '75%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          innerRadius: '65%',
          outerRadius: '100%',
          shape: 'arc',
          backgroundColor: {
            linearGradient: { x1: 0, y1: 1, x2: 0.5, y2: 1 },
            stops: [
              [0, '#7ec044'],
              [1, '#41a1d3']
            ]
          }
        }
      ]
    },
    // the value axis
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      labels: {
        rotation: 0,
        y: 18,
        x: 0,
        distance: -18,
        align: 'center',
        style: {
          fontSize: height < 200 ? '11px' : '14px',
          fontFamily: 'Roboto',
          color: 'rgba(0,0,0,0.87)'
        },
        formatter: function (): string {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          this.value = Math.round(this.value as number);
          const label = this.axis.defaultLabelFormatter.call(this) as string;
          return isNaN(+label[label.length - 1]) ? label : formatNumber(label);
        }
      },
      tickWidth: 0,
      tickPosition: 'outside',
      tickPositioner: function () {
        return [this.min, this.max];
      },
      tickLength: 10
    },
    series: [],
    plotOptions: {
      gauge: {
        dial: {
          baseWidth: 10,
          rearLength: '0',
          radius: '73',
          baseLength: '1',
          backgroundColor: '#656565'
        },
        pivot: {
          radius: 5,
          backgroundColor: '#656565'
        },
        dataLabels: {
          enabled: false,
          y: height * -0.82,
          padding: 10,
          borderWidth: 0,
          align: 'center',
          verticalAlign: 'middle',
          useHTML: true,
          style: {
            color: 'rgba(0,0,0,0.87)',
            fontSize: window.innerWidth >= 1920 && window.innerHeight >= 768 ? '18px' : '14px',
            fontFamily: 'Roboto',
            fontWeight: '500'
          }
        },
        tooltip: {
          followPointer: true
        }
      }
    }
  };
};

export const singleBarOptions = (series?: any[], categories?: string[]): Highcharts.Options => {
  return {
    credits: {
      enabled: false
    },
    chart: {
      type: 'bar',
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      spacingBottom: 0,
      animation: true
    },
    exporting: {
      enabled: false
    },
    // eslint-disable-next-line
    series: series,
    title: {
      text: undefined
    },
    xAxis: {
      lineWidth: 0,
      minorGridLineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          fontWeight: 'normal',
          color: 'rgba(0,0,0,0.6)',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px'
        }
      },
      categories: categories
    },
    yAxis: {
      title: {
        text: undefined
      },
      tickAmount: 10,
      labels: {
        enabled: false
      },
      gridLineWidth: 0
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      bar: {
        pointWidth: 24,
        borderWidth: 0,
        dataLabels: {
          style: {
            fontWeight: 'normal',
            color: 'rgba(0,0,0,0.6)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px'
          },
          x: 12,
          enabled: true
        }
      }
    },
    tooltip: {
      enabled: false
    }
  };
};

export const getGaugeTitleConfig = (height: number, title: string) => {
  return {
    text: title,
    y: height - 10,
    style: { fontSize: height > 400 ? '16px' : '14px' },
    x: 0,
    verticalAlign: 'top' as const,
    floating: true
  };
};
