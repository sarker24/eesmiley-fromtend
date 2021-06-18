import Chart from 'components/charts/base';

export { Chart };
export default Chart;
export { charts as ChartPalettes } from 'styles/palette';

export const ChartConfigs = {
  default: {
    title: '',
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical'
    }
  },
  pie: {
    chart: {
      type: 'pie'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.1f} %'
        },
        showInLegend: true
      }
    }
  },
  bar: {
    chart: {
      type: 'column'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: false
    }
  },
  line: {
    chart: {
      type: 'areaspline',
      zoomType: 'x'
    },
    xAxis: {
      type: 'datetime'
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.75
      }
    }
  },
  gauge: {
    chart: {
      type: 'gauge'
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
          shape: 'arc' as const
        }
      ]
    }
  }
};
