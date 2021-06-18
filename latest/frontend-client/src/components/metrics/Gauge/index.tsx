import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import ReactHighcharts from 'highcharts-react-official';
import { formatNumber } from 'utils/number-format';
import { makeStyles } from '@material-ui/core/styles';

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

export interface GaugeClasses {
  label: string;
}

export interface GaugeOptions {
  name: string;
  // see https://api.highcharts.com/class-reference/Highcharts#.DataLabelsFormatterCallbackFunction
  labelFormatter?: (value: number) => string;
  hideTick?: boolean;
  min?: number;
  max?: number;
  tickFormatter?: (value: number) => string;
  colors?: { to: number; color: string }[];
  classes?: Partial<GaugeClasses>;
}

export interface GaugeProps {
  point: number;
  target?: number;
  options?: GaugeOptions;
}

interface CreateHighChartOptions {
  point: number;
  target?: number;
  options?: GaugeOptions;
  defaultClasses: GaugeClasses;
}

const gaugeWidth = 10;
const gaugeRadius = 95;
const defaultHeight = 130;
const defaultWidth = 'auto';

const baseOptions: Highcharts.Options = {
  chart: {
    type: 'solidgauge',
    margin: [10, 0, 0, 0],
    spacing: [0, 0, 0, 0],
    backgroundColor: 'transparent',
    plotBorderWidth: 0,
    plotShadow: false
  },
  exporting: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  title: null,
  pane: {
    size: '165%',
    center: ['50%', '92%'],
    startAngle: -90,
    endAngle: 90,
    background: [
      {
        // borderWidth needed to make rounded pane edges hack to work,
        // unfortunately it makes it hard to scale the chart (height, width)
        borderWidth: gaugeWidth,
        backgroundColor: '#DBDBDB',
        shape: 'arc',
        borderColor: '#DBDBDB',
        outerRadius: `${gaugeRadius}%`,
        innerRadius: `${gaugeRadius}%`
      }
    ]
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
    solidgauge: {
      borderWidth: 0,
      radius: `${gaugeRadius + 5}%`,
      innerRadius: `${gaugeRadius - 5}%`,
      rounded: true,
      dataLabels: {
        y: gaugeWidth,
        borderWidth: 0,
        useHTML: true
      }
    }
  },
  credits: {
    enabled: false
  },
  yAxis: {
    min: 0,
    lineWidth: 0,
    tickWidth: 2,
    tickLength: gaugeWidth,
    tickColor: '#ffffff',
    tickPosition: 'inside',
    minorTickLength: 0,
    zIndex: 10,
    labels: {
      enabled: false
    },
    minorTickInterval: null,
    title: null
  }
};

const useStyles = makeStyles((theme) => ({
  label: {
    fontWeight: 800,
    fontSize: '26px',
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center'
  }
}));

function createHighChartOptions(options: CreateHighChartOptions): Highcharts.Options {
  const { point, target, options: commonOptions, defaultClasses } = options;
  const {
    name,
    tickFormatter,
    labelFormatter,
    min,
    max,
    hideTick = false,
    colors,
    classes = defaultClasses
  } = commonOptions;
  const chartOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart },
    yAxis: { ...baseOptions.yAxis }
  };
  const data = [point];

  if (colors) {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).stops = colors.map((color) => [
      color.to,
      color.color
    ]);
  }

  if (target) {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).tickPositions = [target];
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).max = target * 2;
  }

  if (min !== undefined) {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).min = min;
  }

  if (max !== undefined) {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).max = max;
  }

  if (hideTick) {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).tickLength = 0;
  } else {
    (chartOptions['yAxis'] as Highcharts.YAxisOptions).labels = {
      useHTML: true,
      enabled: true,
      align: 'center',
      distance: 10,
      reserveSpace: true,
      formatter: function () {
        const value = this.value as number;
        if (tickFormatter) {
          return tickFormatter(value);
        }

        return formatNumber(value);
      }
    };
  }

  return {
    ...chartOptions,
    series: [
      {
        type: 'solidgauge',
        name,
        data: data,
        dataLabels: {
          useHTML: true,
          formatter: function () {
            const labelValue = labelFormatter ? labelFormatter(this.point.y) : this.point.y;
            return `<div class="${classes.label || defaultClasses.label}">${labelValue}</div>`;
          }
        }
      }
    ]
  };
}

const Gauge: React.FunctionComponent<GaugeProps> = (props) => {
  const defaultClasses = useStyles(props);
  const { point, target, options } = props;
  const { name } = options;

  const [chartOptions, setOptions] = React.useState<Highcharts.Options>(
    createHighChartOptions({
      point,
      target,
      options,
      defaultClasses
    })
  );

  React.useEffect(() => {
    const { yAxis, series } = createHighChartOptions({ point, target, options, defaultClasses });
    setOptions({
      yAxis,
      series
    });
  }, [point, target, options]);

  const handleChartCreated = () => {
    const svgElement = document.getElementById(name).getElementsByTagName('svg');

    // hack to make chart pane edges rounded
    if (svgElement.length > 0) {
      const chartPath = svgElement[0].getElementsByTagName('path');
      Array.from(chartPath).forEach((path: SVGPathElement) => {
        path.setAttributeNS(null, 'stroke-linejoin', 'round');
        path.setAttributeNS(null, 'stroke-linecap', 'round');
      });
    }
  };

  return (
    <ReactHighcharts
      containerProps={{
        id: name,
        style: {
          width: `${defaultWidth}px`,
          height: `${defaultHeight}px`
        }
      }}
      highcharts={Highcharts}
      options={chartOptions}
      callback={handleChartCreated}
    />
  );
};

export default Gauge;
