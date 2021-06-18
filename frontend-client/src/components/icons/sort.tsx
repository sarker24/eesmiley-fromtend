import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

const SortIcon: React.FunctionComponent<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d='M3 6v2h18V6H3z' />
    <path d='M3 13h12v-2H3v2z' />
    <path d='M3 18h6v-2H3v2z' />
  </SvgIcon>
);

export default SortIcon;
