import * as React from 'react';
import { Card, CardContent, CardHeader, Grid, makeStyles } from '@material-ui/core';
import { Bar } from 'report/components/Chart';
import { Options } from 'highcharts';
import { Icon } from 'icon';
import Progress from 'report/components/Progress';
import { formatWeight, formatMoney } from 'utils/number-format';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';
import ProgressMessage from 'report/components/ProgressMessage';
import ErrorMessage from 'report/components/ErrorMessage';
import { ApiError } from 'redux/ducks/error';
import { ReportChart, SeriesResponse } from 'redux/ducks/reportData';
import scaleImage from 'static/icons/balance-scale.svg';

interface ComponentProps extends InjectedIntlProps {
  chartOptions: Options;
  chartsData: ReportChart<SeriesResponse>;
  error: ApiError;
}

const FoodWasteStatus: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { chartOptions, chartsData, intl, error } = props;

  const {
    isLoading,
    basis,
    dimension,
    period,
    timeRange: { from, to },
    data: { metrics = [], extra: { target } = { target: null } }
  } = chartsData;

  return (
    <Card>
      <CardHeader
        title={intl.messages['report.foodwaste.recentHistory.title']}
        subheader={intl.formatMessage(
          {
            id:
              basis === 'per-guest'
                ? 'report.foodwaste.recentHistory.perGuest.subtitle'
                : 'report.foodwaste.recentHistory.total.subtitle'
          },
          {
            range: getFormattedTimeRange(from, to),
            period
          }
        )}
        avatar={<Icon icon={scaleImage} />}
      />
      <CardContent>
        {error ? (
          <ErrorMessage error={error} />
        ) : (
          <Grid container spacing={4}>
            <Grid container item xs={12} md={5} alignItems={'center'} justify={'center'}>
              <Grid item xs={12} md={12}>
                {metrics.length && (
                  <Progress
                    className={classes.progress}
                    text={
                      metrics[0].point !== 0 && (
                        <ProgressMessage
                          id={
                            metrics[0].trend === 0
                              ? 'report.quickOverview.trend.equalToTarget'
                              : `report.foodwaste.status.trend.${
                                  metrics[0].trend > 0 ? 'more' : 'less'
                                }FoodWaste`
                          }
                          target={
                            dimension === 'cost'
                              ? formatMoney(target).toString()
                              : basis === 'per-guest'
                              ? formatWeight(target, true, 'g')
                              : formatWeight(target)
                          }
                        />
                      )
                    }
                    value={metrics[0].trend}
                    invertedProgress={true}
                    isLoading={isLoading}
                  />
                )}
              </Grid>
            </Grid>
            <Grid container item xs={12} md={7}>
              <Grid item xs={12} md={11}>
                <Bar chartOptions={chartOptions} isLoading={isLoading} />
              </Grid>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles((theme) => ({
  progress: {
    [theme.breakpoints.up('md')]: {
      marginTop: -60
    }
  }
}));

export default injectIntl(FoodWasteStatus);
