import * as React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';

export interface MetricCardProps extends WithLoadingProps {
  className?: string;
  value: number | string;
  title?: React.ReactNode;
  status?: React.ReactNode;
  chart?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  content: {
    minHeight: '210px',
    padding: `${theme.spacing(3)}px ${theme.spacing(2)}px`,
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center'
  },
  cardMetricValue: {
    fontWeight: 800,
    fontSize: '26px',
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center'
  },
  cardMetricTitle: {
    fontSize: '18px',
    opacity: 0.7,
    fontWeight: 600,
    marginTop: theme.spacing(0.8)
  }
}));

const MetricCard: React.FunctionComponent<MetricCardProps> = (props) => {
  const classes = useStyles(props);
  const { className, value, chart, title, children } = props;

  return (
    <Card className={className}>
      <CardContent className={classes.content}>
        {chart || (
          <Typography
            align='center'
            component='div'
            variant='h2'
            className={classes.cardMetricValue}
          >
            {value}
          </Typography>
        )}
        <Typography align='center' component='h3' variant='h2' className={classes.cardMetricTitle}>
          {title}
        </Typography>
      </CardContent>
      {children}
    </Card>
  );
};

export default withLoading(MetricCard);
