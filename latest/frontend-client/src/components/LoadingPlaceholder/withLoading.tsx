import * as React from 'react';
import classNames from 'classnames';
import { Spinner } from 'LoadingPlaceholder/index';
import { makeStyles } from '@material-ui/core/styles';

export interface WithLoadingProps {
  isLoading?: boolean;
}

type LoadingProps<T> = T & WithLoadingProps;

function withLoading<T>(
  WrappedComponent: React.ComponentType<LoadingProps<T>>
): React.FunctionComponent<LoadingProps<T>> {
  return (props) => {
    const classes = useStyles(props);
    const { isLoading = false, ...rest } = props;
    return (
      <div className={classNames(classes.chartWrapper, { [classes.faded]: isLoading })}>
        {isLoading && <Spinner className={classes.spinner} />}
        <WrappedComponent {...(rest as T)} isLoading={isLoading} />
      </div>
    );
  };
}

const useStyles = makeStyles({
  chartWrapper: {
    position: 'relative'
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: 100
  },
  container: {
    overflow: 'visible !important',

    '& .highcharts-xaxis .highcharts-tick': {
      '&:nth-last-child(-n+3)': {
        display: 'none'
      }
    }
  },
  faded: {
    '& > :nth-child(2)': {
      opacity: 0.4,
      pointerEvents: 'none'
    }
  }
});

export default withLoading;
