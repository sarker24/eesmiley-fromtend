import * as React from 'react';
import FactsOverview from './components/FactsOverview';
import FoodWasteOverview from './components/FoodWasteOverview';
import DashboardMetrics from './components/DashboardMetrics';
import { PageTitle } from 'report/components/ReportPageLayout';
import { Grid } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface ComponentProps extends InjectedIntlProps {
  downloadButton: React.ReactNode;
}

const QuickOverview: React.FunctionComponent<ComponentProps> = ({ downloadButton, intl }) => (
  <>
    <PageTitle>{intl.messages['report.quickOverview.title']}</PageTitle>
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <FactsOverview />
      </Grid>
      <Grid item xs={12}>
        <DashboardMetrics />
      </Grid>
      <Grid item xs={12}>
        <FoodWasteOverview />
      </Grid>
    </Grid>
    {downloadButton}
  </>
);

export default injectIntl(QuickOverview);
