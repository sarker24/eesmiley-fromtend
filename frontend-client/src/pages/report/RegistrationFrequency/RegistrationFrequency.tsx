import * as React from 'react';
import { PageTitle } from 'report/components/ReportPageLayout';
import RegistrationsPerAccount from './components/RegistrationsPerAccount';
import FactsOverview from './components/FactsOverview';
import RegistrationsPerDay from './components/RegistrationsPerDay';
import { Grid } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface ComponentProps extends InjectedIntlProps {
  downloadButton: React.ReactNode;
}

const RegistrationFrequency: React.FunctionComponent<ComponentProps> = ({
  downloadButton,
  intl
}) => (
  <>
    <PageTitle>{intl.messages['report.registrationFrequency.title']}</PageTitle>
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <FactsOverview />
      </Grid>
      <Grid item xs={12}>
        <RegistrationsPerDay />
      </Grid>
      <Grid item xs={12}>
        <RegistrationsPerAccount />
      </Grid>
    </Grid>
    {downloadButton}
  </>
);

export default injectIntl(RegistrationFrequency);
