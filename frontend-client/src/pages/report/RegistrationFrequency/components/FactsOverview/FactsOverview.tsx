import * as React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import Fact from 'report/components/Fact';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ProgressMessage from 'report/components/ProgressMessage';
import ErrorMessage from 'report/components/ErrorMessage';
import { MetricsResponse, ReportChart } from 'redux/ducks/reportData';

interface ComponentProps extends InjectedIntlProps {
  regFrequencyMetrics: ReportChart<MetricsResponse>;
}

const FactsOverview: React.FunctionComponent<ComponentProps> = ({
  regFrequencyMetrics,

  intl
}) => {
  const {
    error,
    isLoading,
    data: { metrics = [] }
  } = regFrequencyMetrics;
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
              <Fact
                title={
                  metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                    ? intl.messages['report.frequency.avgRegistrationDaysPerWeek']
                    : intl.messages['report.frequency.avgRegistrationsPerDay']
                }
                value={metric.point as number}
                unit={metric.unit}
                isLoading={isLoading}
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
            </CardContent>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12} md={6} lg={3} container>
        <Card>
          <CardContent>
            <Fact
              title={'Correctly registered days as expected'}
              value={100}
              disabled
              unit={'%'}
              message={{
                progressValue: 1.12,
                text: 'more days registered as expected since previous period'
              }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={3} container>
        <Card>
          <CardContent>
            <Fact
              title={'Registered days as expected including other registered days'}
              value={100}
              disabled
              unit={'%'}
              message={{
                progressValue: -6.41,
                text: 'less days registered since previous period'
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default injectIntl(FactsOverview);
