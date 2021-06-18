import { AxisPlotLinesOptions } from 'highcharts';
import theme from 'styles/themes/reports';
import getPlotLineLabel from 'report/components/Chart/Bar/utils/getPlotLineLabel';

interface PlotLineData {
  text: string;
  lineStyle?: 'solid' | 'dashed';
  value: number;
  color?: string;
  width?: number;
}

const getPlotLines = (plotLinesData: Array<PlotLineData>): Array<AxisPlotLinesOptions> => {
  const verticalMarginBetweenLabels = 13;

  return plotLinesData.map(
    (plotLine: PlotLineData, index): AxisPlotLinesOptions => ({
      width: plotLine.width ? plotLine.width : 1,
      zIndex: 50 - index,
      value: plotLine.value,
      color: plotLine.color ? plotLine.color : theme.palette.grey.A100,
      dashStyle: plotLine.lineStyle === 'dashed' ? 'Dash' : 'Solid',
      label: {
        rotation: 0,
        x: 0,
        y: -verticalMarginBetweenLabels * (index + 1),
        style: {
          fontSize: '10px',
          color: theme.palette.grey[400],
          letterSpacing: '0.24px',
          zIndex: 50 - index,
          background: theme.palette.common.white,
          marginTop: '5px'
        },
        useHTML: true,
        text: getPlotLineLabel({
          text: plotLine.text,
          borderStyle: plotLine.lineStyle,
          borderColor: plotLine.color,
          borderThickness: plotLine.width,
          distance: verticalMarginBetweenLabels * (index + 1)
        })
      }
    })
  );
};

export default getPlotLines;
