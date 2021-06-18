import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import classNames from 'classnames';
import { Growth } from 'metrics/StatusBar';

export interface GrowthIndicatorProps {
  value: number;
  growth: Growth;
  isInverted?: boolean;
}

const useStyles = makeStyles((theme) => ({
  indicatorUpward: {
    transform: 'rotate(180deg)'
  },
  positive: {
    color: theme.palette.success.main
  },
  negative: {
    color: theme.palette.error.main
  }
}));

const hiddenIndicatorStates = ['disabled', 'equal'] as Growth[];

const GrowthIndicator: React.FunctionComponent<GrowthIndicatorProps> = (props) => {
  const classes = useStyles(props);
  const { value, growth, isInverted = false } = props;
  return value && !hiddenIndicatorStates.includes(growth) ? (
    <ArrowDownwardIcon
      className={classNames({
        [classes.indicatorUpward]: isInverted ? value < 0 : value >= 0,
        [classes[growth]]: true
      })}
    />
  ) : null;
};

export default GrowthIndicator;
