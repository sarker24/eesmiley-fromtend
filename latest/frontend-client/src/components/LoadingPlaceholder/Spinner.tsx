import SVGInline from 'react-svg-inline';
import * as React from 'react';
import SpinnerIcon from 'static/img/verdensmaal.svg';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
const sizeMap = {
  small: '20px',
  md: '40px',
  lg: '60px'
};

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

const useStyles = makeStyles({
  root: {
    display: 'inline-block'
  }
});

const Spinner: React.FunctionComponent<SpinnerProps> = (props) => {
  const { size = 'md', className } = props;
  const classes = useStyles(props);
  return (
    <SVGInline
      className={classNames(classes.root, className)}
      width={sizeMap[size]}
      height={sizeMap[size]}
      svg={SpinnerIcon}
    />
  );
};

export default Spinner;
