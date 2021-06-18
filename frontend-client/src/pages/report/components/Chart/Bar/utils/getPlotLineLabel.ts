import theme from 'styles/themes/reports';

interface PlotLineLabelProps {
  text: string;
  borderStyle: 'solid' | 'dashed';
  distance: number;
  borderColor?: string;
  borderThickness?: number;
}

const getPlotLineLabel = (props: PlotLineLabelProps): string => {
  const { text, borderStyle, borderColor, distance, borderThickness } = props;
  const pinStyle = `
    display: inline-block;
    background: ${theme.palette.common.white};
    width: 7px;
    height: 7px;
    border: 2px solid ${theme.palette.grey[400]};
    border-radius: 50%;
    margin-left: -3.5px;
    margin-right: 2px;
  `;

  const plotLineExtensionStyle = `
    height: ${distance}px;
    position: absolute;
    left: ${borderThickness ? -borderThickness / 2 : -1}px;
    bottom: -${distance}px;
    border-left: ${borderThickness ? `${borderThickness}px` : '1px'} ${
    borderStyle ? borderStyle : 'solid'
  } ${borderColor ? borderColor : theme.palette.grey.A100};
  `;

  return `
    <span style='${pinStyle}'></span>
    ${text}
    <span style='${plotLineExtensionStyle}'></span>
  `;
};

export default getPlotLineLabel;
