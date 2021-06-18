import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { CardHeader, Grid, Card, CardContent, Box } from '@material-ui/core';
import Fact from 'report/components/Fact';
import ProgressMessage from 'report/components/ProgressMessage';
import { Dimension, Period } from 'redux/ducks/reports-new';
import createValueFormatter from 'report/utils/createValueFormatter';
import ErrorMessage from 'report/components/ErrorMessage';
import { Icon } from 'icon';
import { MetricsResponse, ReportChart } from 'redux/ducks/reportData';
import scaleImage from 'static/icons/balance-scale.svg';
import guestsImage from 'static/icons/guests.svg';
import calendarImage from 'static/icons/calendar-week.svg';
import tallyImage from 'static/icons/tally.svg';

interface ComponentProps extends InjectedIntlProps {
  foodWasteMetrics: ReportChart<MetricsResponse>;
  regFrequencyMetrics: ReportChart<MetricsResponse>;
  dimension: Dimension;
  period: Period;
}

// these facts wrappers should be refactored into layout independent list component,
// instead of fixing it into a layout with the grid
const FactsOverview: React.FunctionComponent<ComponentProps> = ({
  foodWasteMetrics,
  regFrequencyMetrics,
  dimension,
  period,
  intl
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item lg={6} container>
        <Card>
          <CardHeader title={intl.messages['report.foodwaste.title']} />
          <CardContent>
            <Box mb={2} mt={1.5}>
              <Grid container alignContent={'flex-start'}>
                {foodWasteMetrics.error ? (
                  <ErrorMessage error={foodWasteMetrics.error} />
                ) : (
                  foodWasteMetrics.data &&
                  foodWasteMetrics.data.metrics &&
                  foodWasteMetrics.data.metrics.map((metric) => (
                    <Grid item xs={12} md={6} key={metric.id}>
                      <Fact
                        title={
                          metric.id === 'foodwasteCurrentPeriod'
                            ? intl.messages['report.totalFoodwaste.title']
                            : intl.messages['report.foodwaste.perGuest.title']
                        }
                        value={createValueFormatter(
                          dimension,
                          metric.id === 'foodwasteCurrentPeriod' ? 'total' : 'per-guest'
                        ).format(metric.point as number, metric.unit)}
                        icon={
                          <Icon
                            icon={metric.id === 'foodwasteCurrentPeriod' ? scaleImage : guestsImage}
                          />
                        }
                        formatValue={false}
                        dimension={dimension}
                        isLoading={foodWasteMetrics.isLoading}
                        message={{
                          progressValue: metric.trend,
                          text: (
                            <ProgressMessage
                              id={
                                metric.trend === 0
                                  ? 'report.terms.noChangeComparedToPrevPeriod'
                                  : `report.quickOverview.${
                                      metric.trend > 0 ? 'more' : 'less'
                                    }Foodwaste.${period || 'week'}`
                              }
                              trend={metric.trend}
                            />
                          ),
                          invertedProgress: true
                        }}
                      />
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item lg={6} container>
        <Card>
          <CardHeader title={intl.messages['report.registrationFrequency.title']} />
          <CardContent>
            <Box mb={2} mt={1.5}>
              <Grid container alignContent={'flex-start'}>
                {regFrequencyMetrics.error ? (
                  <ErrorMessage error={regFrequencyMetrics.error} />
                ) : (
                  regFrequencyMetrics.data &&
                  regFrequencyMetrics.data.metrics &&
                  regFrequencyMetrics.data.metrics.map((metric) => (
                    <Grid item xs={12} md={6} key={metric.id}>
                      <Fact
                        title={
                          metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                            ? intl.messages['report.frequency.avgRegistrationDaysPerWeek']
                            : intl.messages['report.frequency.avgRegistrationsPerDay']
                        }
                        value={metric.point as number}
                        icon={
                          <Icon
                            icon={
                              metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                                ? calendarImage
                                : tallyImage
                            }
                          />
                        }
                        isLoading={regFrequencyMetrics.isLoading}
                        message={{
                          progressValue: metric.trend,
                          text: (
                            <ProgressMessage
                              id={
                                metric.trend === 0
                                  ? 'report.terms.noChangeComparedToPrevPeriod'
                                  : metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                                  ? `report.quickOverview.${
                                      metric.trend > 0 ? 'more' : 'less'
                                    }DaysRegistered`
                                  : `report.quickOverview.${
                                      metric.trend > 0 ? 'more' : 'less'
                                    }RegistrationsPerDay`
                              }
                              trend={metric.trend}
                            />
                          )
                        }}
                      />
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default injectIntl(FactsOverview);
