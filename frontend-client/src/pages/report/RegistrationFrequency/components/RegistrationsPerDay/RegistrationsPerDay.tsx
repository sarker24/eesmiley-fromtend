import * as React from 'react';
import { Card, CardContent, CardHeader, Grid } from '@material-ui/core';
import { Line } from 'report/components/Chart';
import { Options } from 'highcharts';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ErrorMessage from 'report/components/ErrorMessage';
import { ApiError } from 'redux/ducks/error';

interface ComponentProps extends InjectedIntlProps {
  chartOptions: Options;
  isLoading: boolean;
  error: ApiError;
}

const RegistrationsPerDay: React.FunctionComponent<ComponentProps> = ({
  chartOptions,
  isLoading,
  error,
  intl
}) => (
  <Card>
    <CardHeader
      title={intl.messages['report.frequency.avgRegistrationsPerDay']}
      // Temporarily disabled until text format is agreed on:
      // subheader={ intl.messages['report.frequency.avgRegistrationsPerDay.description'] }
    />
    <CardContent>
      {error ? (
        <ErrorMessage error={error} />
      ) : (
        <Grid container justify={'center'}>
          <Grid item xs={12} md={11}>
            <Line chartOptions={chartOptions} isLoading={isLoading} />
          </Grid>
        </Grid>
      )}
    </CardContent>
  </Card>
);

export default injectIntl(RegistrationsPerDay);
