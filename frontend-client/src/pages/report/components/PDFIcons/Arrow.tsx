import ReactPDF, { Path, Svg } from '@react-pdf/renderer';
import * as React from 'react';

// to do later: transform .svg images automatically
// see https://github.com/diegomura/react-pdf/issues/1234

export interface ArrowProps {
  rootStyle?: ReactPDF.Styles[string];
  pathStyle?: ReactPDF.Styles[string];
  direction?: 'up' | 'down';
}

const Arrow: React.FunctionComponent<ArrowProps> = (props) => {
  const { rootStyle, pathStyle, direction = 'down' } = props;
  const { width, height, ...rootProps } = rootStyle || {};
  const { color, ...pathProps } = pathStyle || {};
  const transform = direction === 'up' ? 'rotate(180deg)' : 'rotate(0)';
  return (
    <Svg width={width} height={height} style={{ transform, ...rootProps }} viewBox='0 0 24 24'>
      <Path
        style={{ fill: color, ...pathProps }}
        d='M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z'
      />
    </Svg>
  );
};

export default Arrow;
