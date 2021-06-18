import * as React from 'react';
import { Box, CardHeader, Grid } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Line } from 'report/components/Chart';
import Fact from 'report/components/Fact';
import { Options } from 'highcharts';
import ProgressMessage from 'report/components/ProgressMessage';
import { formatMoney, formatWeight } from 'utils/number-format';
import moment from 'moment';
import ErrorMessage from 'report/components/ErrorMessage';
import { ReportChart, SeriesResponse } from 'redux/ducks/reportData';

type DataPoint = { value: number; label: string };

interface ComponentProps extends InjectedIntlProps {
  chartOptions: Options;
  trendFoodWaste: ReportChart<SeriesResponse>;
}

const MonthFormat = 'MMMM YYYY';
const Trend: React.FunctionComponent<ComponentProps> = ({ chartOptions, intl, trendFoodWaste }) => {
  const {
    error,
    isLoading,
    dimension,
    basis,
    data: { metrics = [] }
  } = trendFoodWaste;

  return (
    <Box mt={4}>
      <CardHeader
        title={intl.messages['report.quickOverview.trend']}
        subheader={intl.messages['report.quickOverview.trend.description']}
      />
      {error ? (
        <ErrorMessage error={error} />
      ) : (
        <Grid container spacing={4} justify={'space-around'}>
          <Grid item xs={12} md={8}>
            {chartOptions && <Line chartOptions={chartOptions} />}
          </Grid>
          <Grid container item xs={12} md={4} lg={3}>
            {metrics &&
              metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={12} key={metric.id}>
                  <Fact
                    title={
                      ['foodwasteTotalTrendBestMonth', 'foodwastePerGuestTrendBestMonth'].includes(
                        metric.id
                      )
                        ? intl.messages['report.quickOverview.trend.bestMonth']
                        : intl.messages['report.quickOverview.trend.worstMonth']
                    }
                    value={
                      (metric.point as DataPoint).label
                        ? moment.utc((metric.point as DataPoint).label).format(MonthFormat)
                        : '-'
                    }
                    isLoading={isLoading}
                    message={
                      (metric.point as DataPoint).label && {
                        progressValue: metric.trend,
                        text: (
                          <ProgressMessage
                            id={
                              metric.trend === 0
                                ? 'report.quickOverview.trend.equalToTarget'
                                : `report.quickOverview.trend.${
                                    metric.trend > 0 ? 'more' : 'less'
                                  }Foodwaste`
                            }
                            trend={metric.trend}
                            value={
                              dimension === 'cost'
                                ? formatMoney((metric.point as DataPoint).value).toString()
                                : basis === 'per-guest'
                                ? formatWeight((metric.point as DataPoint).value, true, 'g')
                                : formatWeight((metric.point as DataPoint).value)
                            }
                          />
                        ),
                        invertedProgress: true
                      }
                    }
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default injectIntl(Trend);
