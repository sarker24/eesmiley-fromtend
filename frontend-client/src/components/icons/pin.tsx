import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

const PinIcon: React.FunctionComponent<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d='M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z' />
  </SvgIcon>
);

export default PinIcon;
