import * as React from 'react';
import { makeStyles, SvgIcon, SvgIconProps } from '@material-ui/core';

const SortDownIcon: React.FunctionComponent<SvgIconProps> = (props) => {
  const classes = useStyles(props);

  return (
    <SvgIcon className={classes.root} {...props}>
      <path d='M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z' />
    </SvgIcon>
  );
};

const useStyles = makeStyles({
  root: {
    transform: 'scale(-1,1)'
  }
});

export default SortDownIcon;
