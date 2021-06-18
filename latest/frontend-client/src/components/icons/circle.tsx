import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

const Circle: React.FunctionComponent<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d='M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' />
  </SvgIcon>
);

export default Circle;
