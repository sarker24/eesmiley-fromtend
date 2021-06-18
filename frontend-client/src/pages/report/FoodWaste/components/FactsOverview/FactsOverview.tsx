import * as React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import Fact from 'report/components/Fact';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ProgressMessage from 'report/components/ProgressMessage';
import getFactsHeadlines from 'report/FoodWaste/utils/getFactsHeadlines';
import ErrorMessage from 'report/components/ErrorMessage';
import MetricInfoIcon from 'report/FoodWaste/components/MetricInfoIcon';
import { ApiError } from 'redux/ducks/error';
import { MetricsResponse, ReportChart } from 'redux/ducks/reportData';

interface OwnProps {
  foodWasteMetrics: ReportChart<MetricsResponse>;
  error: ApiError;
}

interface ComponentProps extends OwnProps, InjectedIntlProps {}

const FactsOverview: React.FunctionComponent<ComponentProps> = (props) => {
  const { foodWasteMetrics, intl, error } = props;

  const {
    isLoading,
    basis,
    period,
    dimension,
    data: { metrics }
  } = foodWasteMetrics;

  return error ? (
    <Card>
      <ErrorMessage error={error} />
    </Card>
  ) : (
    <Grid container spacing={3}>
      {metrics.map((metric) => (
        <Grid item xs={12} md={6} lg={3} container key={metric.id}>
          <Card>
            <CardContent>
              {
                <Fact
                  title={
                    <>
                      {getFactsHeadlines(intl)[metric.id]} <MetricInfoIcon />
                    </>
                  }
                  value={metric.point as number}
                  formatValue={true}
                  dimension={dimension}
                  basis={basis}
                  message={{
                    progressValue: metric.trend,
                    text: (
                      <ProgressMessage
                        id={
                          metric.trend === 0
                            ? metric.id !== 'foodwasteCurrentPeriod' &&
                              metric.id !== 'foodwastePerGuestCurrentPeriod'
                              ? `report.terms.noChangeComparedToSelectedPeriod`
                              : `report.terms.noChangeComparedToPrevPeriod`
                            : metric.id === 'foodwasteCurrentPeriod' ||
                              metric.id === 'foodwastePerGuestCurrentPeriod'
                            ? `report.quickOverview.${
                                metric.trend > 0 ? 'more' : 'less'
                              }Foodwaste.${period || 'week'}`
                            : `report.foodwaste.${
                                metric.trend > 0 ? 'more' : 'less'
                              }FoodwasteThisPeriod`
                        }
                        trend={metric.trend}
                      />
                    ),
                    invertedProgress: true
                  }}
                  isLoading={isLoading}
                />
              }
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default injectIntl(FactsOverview);
